import dayjs from 'dayjs'
import type { ImageAsset, Layout } from '@/print'
import type { SqliteConnection } from '../types'
import { findImageAssets, saveImageAsset } from './imageAssetRepository'
import {
  collectStaticAssetIds,
  deserializeElement,
  deserializeField,
  type LayoutElementRow,
  type LayoutFieldRow,
  serializeElement,
  serializeField,
} from './serializer'

type LayoutRow = {
  id: string
  name: string
  created_at: number
  updated_at: number
}

const assembleLayouts = (
  layoutRows: LayoutRow[],
  fieldRows: LayoutFieldRow[],
  elementRows: LayoutElementRow[],
  assets: ReadonlyMap<string, ImageAsset>,
): Layout[] =>
  layoutRows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fields: fieldRows
      .filter((field) => field.layout_id === row.id)
      .map(deserializeField),
    elements: elementRows
      .filter((element) => element.layout_id === row.id)
      .map((element) => deserializeElement(element, assets)),
  }))

const readLayouts = async (
  db: SqliteConnection,
  layoutRows: LayoutRow[],
): Promise<Layout[]> => {
  if (layoutRows.length === 0) {
    return []
  }

  const ids = layoutRows.map(({ id }) => id)
  const placeholders = ids.map(() => '?').join(', ')

  const fieldResult = await db.execute(
    `SELECT * FROM layout_fields WHERE layout_id IN (${placeholders})
     ORDER BY sort_order ASC`,
    ids,
  )
  const elementResult = await db.execute(
    `SELECT * FROM layout_elements WHERE layout_id IN (${placeholders})
     ORDER BY sort_order ASC`,
    ids,
  )

  const elementRows = elementResult.rows as unknown as LayoutElementRow[]

  // 固定の画像は要素の JSON から参照しているため、必要な分だけ読み込む
  const assetIds = [
    ...new Set(
      elementRows.flatMap((row) => {
        const source = JSON.parse(row.source)
        return source.kind === 'staticImage' && source.assetId
          ? [source.assetId as string]
          : []
      }),
    ),
  ]
  const assets = new Map(
    (await findImageAssets(db, assetIds)).map((asset) => [asset.id, asset]),
  )

  return assembleLayouts(
    layoutRows,
    fieldResult.rows as unknown as LayoutFieldRow[],
    elementRows,
    assets,
  )
}

/**
 * すべてのレイアウトを、新しく更新されたものから順に読む
 */
export const findAllLayouts = async (
  db: SqliteConnection,
): Promise<Layout[]> => {
  const result = await db.execute(
    'SELECT * FROM layouts ORDER BY updated_at DESC',
  )
  return readLayouts(db, result.rows as unknown as LayoutRow[])
}

/**
 * IDを指定してレイアウトを読む
 */
export const findLayoutById = async (
  db: SqliteConnection,
  id: string,
): Promise<Layout | undefined> => {
  const result = await db.execute('SELECT * FROM layouts WHERE id = ?', [id])
  const layouts = await readLayouts(db, result.rows as unknown as LayoutRow[])
  return layouts[0]
}

/**
 * レイアウトを保存する
 *
 * フィールドと要素は並び順ごと入れ替えるため、いったん削除してから入れ直す。
 * `updatedAt` は保存した時刻で更新する。
 */
export const saveLayout = async (
  db: SqliteConnection,
  layout: Layout,
): Promise<Layout> => {
  const updatedAt = dayjs().valueOf()

  await db.transaction(async (tx) => {
    await tx.execute(
      `INSERT INTO layouts (id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         updated_at = excluded.updated_at`,
      [layout.id, layout.name, layout.createdAt, updatedAt],
    )

    // 固定の画像は要素より先に入れる
    for (const element of layout.elements) {
      if (
        element.type === 'image' &&
        element.source.kind === 'static' &&
        element.source.asset
      ) {
        await saveImageAsset(tx, element.source.asset, updatedAt)
      }
    }

    // 要素は参照されていないため、まとめて入れ替える
    await tx.execute('DELETE FROM layout_elements WHERE layout_id = ?', [
      layout.id,
    ])

    // 差し込み口は印刷データの値から参照されている。まとめて消すと、
    // 残す差し込み口の値まで連鎖削除されるため、無くなったものだけを消す
    const fieldIds = layout.fields.map(({ id }) => id)
    const placeholders = fieldIds.map(() => '?').join(', ')
    await tx.execute(
      `DELETE FROM layout_fields
       WHERE layout_id = ?
       ${fieldIds.length ? `AND id NOT IN (${placeholders})` : ''}`,
      [layout.id, ...fieldIds],
    )

    for (const [index, field] of layout.fields.entries()) {
      const row = serializeField(field, layout.id, index)
      await tx.execute(
        `INSERT INTO layout_fields (id, layout_id, key, label, value_type, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           key = excluded.key,
           label = excluded.label,
           value_type = excluded.value_type,
           sort_order = excluded.sort_order`,
        [
          row.id,
          row.layout_id,
          row.key,
          row.label,
          row.value_type,
          row.sort_order,
        ],
      )
    }

    for (const [index, element] of layout.elements.entries()) {
      const row = serializeElement(element, layout.id, index)
      await tx.execute(
        `INSERT INTO layout_elements (id, layout_id, sort_order, type, props, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.layout_id,
          row.sort_order,
          row.type,
          row.props,
          row.source,
        ],
      )
    }
  })

  return { ...layout, updatedAt }
}

/**
 * レイアウトを削除する
 *
 * 紐づくフィールド・要素・印刷データは外部キーの連鎖削除で消える。
 */
export const deleteLayout = async (
  db: SqliteConnection,
  id: string,
): Promise<void> => {
  await db.execute('DELETE FROM layouts WHERE id = ?', [id])
}

/**
 * レイアウトが参照している固定の画像のIDを集める
 */
export const collectLayoutAssetIds = (layouts: Layout[]): string[] => [
  ...new Set(
    layouts.flatMap(({ elements }) => collectStaticAssetIds(elements)),
  ),
]
