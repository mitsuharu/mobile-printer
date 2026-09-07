import dayjs from 'dayjs'
import type { ImageAsset, PrintData, PrintDataValue } from '@/print'
import type { SqliteConnection } from '../types'
import { findImageAssets, saveImageAsset } from './imageAssetRepository'

type PrintDataRow = {
  id: string
  layout_id: string
  title: string
  created_at: number
  updated_at: number
}

type PrintDataValueRow = {
  print_data_id: string
  field_id: string
  text_value: string | null
  asset_id: string | null
}

const toValue = (
  row: PrintDataValueRow,
  assets: ReadonlyMap<string, ImageAsset>,
): PrintDataValue | undefined => {
  if (row.asset_id) {
    const asset = assets.get(row.asset_id)
    return asset ? { kind: 'image', asset } : undefined
  }
  if (row.text_value !== null) {
    return { kind: 'text', value: row.text_value }
  }
  return undefined
}

const readPrintData = async (
  db: SqliteConnection,
  rows: PrintDataRow[],
): Promise<PrintData[]> => {
  if (rows.length === 0) {
    return []
  }

  const ids = rows.map(({ id }) => id)
  const placeholders = ids.map(() => '?').join(', ')
  const valueResult = await db.execute(
    `SELECT * FROM print_data_values WHERE print_data_id IN (${placeholders})`,
    ids,
  )
  const valueRows = valueResult.rows as unknown as PrintDataValueRow[]

  const assetIds = [
    ...new Set(
      valueRows.flatMap((row) => (row.asset_id ? [row.asset_id] : [])),
    ),
  ]
  const assets = new Map(
    (await findImageAssets(db, assetIds)).map((asset) => [asset.id, asset]),
  )

  return rows.map((row) => ({
    id: row.id,
    layoutId: row.layout_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    values: Object.fromEntries(
      valueRows
        .filter((value) => value.print_data_id === row.id)
        .map((value) => [value.field_id, toValue(value, assets)]),
    ),
  }))
}

/**
 * レイアウトに紐づく印刷データを、新しく更新されたものから順に読む
 */
export const findPrintDataByLayoutId = async (
  db: SqliteConnection,
  layoutId: string,
): Promise<PrintData[]> => {
  const result = await db.execute(
    'SELECT * FROM print_data WHERE layout_id = ? ORDER BY updated_at DESC',
    [layoutId],
  )
  return readPrintData(db, result.rows as unknown as PrintDataRow[])
}

/**
 * すべての印刷データを、新しく更新されたものから順に読む
 */
export const findAllPrintData = async (
  db: SqliteConnection,
): Promise<PrintData[]> => {
  const result = await db.execute(
    'SELECT * FROM print_data ORDER BY updated_at DESC',
  )
  return readPrintData(db, result.rows as unknown as PrintDataRow[])
}

/**
 * 印刷データを保存する
 *
 * 値は入れ替えるため、いったん削除してから入れ直す。
 */
export const savePrintData = async (
  db: SqliteConnection,
  printData: PrintData,
): Promise<PrintData> => {
  const updatedAt = dayjs().valueOf()

  await db.transaction(async (tx) => {
    await tx.execute(
      `INSERT INTO print_data (id, layout_id, title, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         updated_at = excluded.updated_at`,
      [
        printData.id,
        printData.layoutId,
        printData.title,
        printData.createdAt,
        updatedAt,
      ],
    )

    // 画像は値より先に入れる
    for (const value of Object.values(printData.values)) {
      if (value?.kind === 'image') {
        await saveImageAsset(tx, value.asset, updatedAt)
      }
    }

    await tx.execute('DELETE FROM print_data_values WHERE print_data_id = ?', [
      printData.id,
    ])

    for (const [fieldId, value] of Object.entries(printData.values)) {
      if (!value) {
        continue
      }
      await tx.execute(
        `INSERT INTO print_data_values (print_data_id, field_id, text_value, asset_id)
         VALUES (?, ?, ?, ?)`,
        [
          printData.id,
          fieldId,
          value.kind === 'text' ? value.value : null,
          value.kind === 'image' ? value.asset.id : null,
        ],
      )
    }
  })

  return { ...printData, updatedAt }
}

/**
 * 印刷データを削除する
 *
 * 値は外部キーの連鎖削除で消える。
 */
export const deletePrintData = async (
  db: SqliteConnection,
  id: string,
): Promise<void> => {
  await db.execute('DELETE FROM print_data WHERE id = ?', [id])
}
