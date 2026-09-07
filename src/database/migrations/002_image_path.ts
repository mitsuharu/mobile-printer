import type { Migration } from './types'

/**
 * 画像を Base64 ではなくファイルとして持つ
 *
 * 一覧を読むたびに Base64 がブリッジを渡ってメモリへ載っていたため、
 * 画像の実体はファイルへ置き、データベースにはパスだけを持たせる。
 * 依頼により既存データの引き継ぎは行わないため、作り直す。
 */
export const imagePathMigration: Migration = {
  version: 2,
  statements: [
    'DROP TABLE image_assets',

    `CREATE TABLE image_assets (
      id          TEXT PRIMARY KEY,
      path        TEXT    NOT NULL,
      width       INTEGER NOT NULL,
      image_type  TEXT    NOT NULL,
      created_at  INTEGER NOT NULL
    )`,
  ],
}
