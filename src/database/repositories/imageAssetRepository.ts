import type { ImageAsset } from '@/print'
import { deleteImageFile } from '@/utils/imageStore'
import type { SqliteConnection, SqliteTransaction } from '../types'

type ImageAssetRow = {
  id: string
  path: string
  width: number
  image_type: string
  created_at: number
}

const toImageAsset = (row: ImageAssetRow): ImageAsset => ({
  id: row.id,
  path: row.path,
  width: row.width,
  imageType: row.image_type as ImageAsset['imageType'],
})

/**
 * 指定したIDの画像をまとめて読む
 */
export const findImageAssets = async (
  db: SqliteConnection,
  ids: string[],
): Promise<ImageAsset[]> => {
  if (ids.length === 0) {
    return []
  }
  const placeholders = ids.map(() => '?').join(', ')
  const result = await db.execute(
    `SELECT * FROM image_assets WHERE id IN (${placeholders})`,
    ids,
  )
  return (result.rows as unknown as ImageAssetRow[]).map(toImageAsset)
}

/**
 * 画像を保存する
 *
 * 同じIDが既にあれば上書きする。
 */
export const saveImageAsset = async (
  tx: SqliteTransaction,
  asset: ImageAsset,
  createdAt: number,
): Promise<void> => {
  await tx.execute(
    `INSERT INTO image_assets (id, path, width, image_type, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       path = excluded.path,
       width = excluded.width,
       image_type = excluded.image_type`,
    [asset.id, asset.path, asset.width, asset.imageType, createdAt],
  )
}

/**
 * どこからも参照されていない画像を削除する
 *
 * レイアウトの要素が固定の画像として参照するIDは JSON に埋まっているため、
 * 参照中のIDを引数で受け取る。
 */
export const deleteUnreferencedImageAssets = async (
  db: SqliteConnection,
  referencedIds: string[],
): Promise<number> => {
  const placeholders = referencedIds.map(() => '?').join(', ')
  const notInLayouts = referencedIds.length
    ? `AND id NOT IN (${placeholders})`
    : ''

  const condition = `WHERE id NOT IN (SELECT asset_id FROM print_data_values WHERE asset_id IS NOT NULL)
     ${notInLayouts}`

  // 行を消す前に、消す対象のファイルを控えておく
  const target = await db.execute(
    `SELECT * FROM image_assets ${condition}`,
    referencedIds,
  )
  const assets = (target.rows as unknown as ImageAssetRow[]).map(toImageAsset)

  const result = await db.execute(
    `DELETE FROM image_assets ${condition}`,
    referencedIds,
  )

  for (const asset of assets) {
    await deleteImageFile(asset.path)
  }

  return result.rowsAffected
}
