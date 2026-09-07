import type { Migration } from './types'

/**
 * 初版スキーマ
 *
 * レイアウト（体裁と入力項目の定義）と、印刷データ（入力項目へ入れる値）を分けて保存する。
 * 画像の Base64 は一覧表示のたびに読み込まないよう `image_assets` へ分離する。
 */
export const initialMigration: Migration = {
  version: 1,
  statements: [
    `CREATE TABLE layouts (
      id          TEXT PRIMARY KEY,
      name        TEXT    NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    )`,

    `CREATE TABLE image_assets (
      id          TEXT PRIMARY KEY,
      base64      TEXT    NOT NULL,
      width       INTEGER NOT NULL,
      image_type  TEXT    NOT NULL,
      created_at  INTEGER NOT NULL
    )`,

    `CREATE TABLE layout_fields (
      id          TEXT PRIMARY KEY,
      layout_id   TEXT    NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
      key         TEXT    NOT NULL,
      label       TEXT    NOT NULL,
      value_type  TEXT    NOT NULL,
      sort_order  INTEGER NOT NULL,
      UNIQUE (layout_id, key)
    )`,

    `CREATE INDEX idx_layout_fields_layout
      ON layout_fields(layout_id, sort_order)`,

    `CREATE TABLE layout_elements (
      id          TEXT PRIMARY KEY,
      layout_id   TEXT    NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
      sort_order  INTEGER NOT NULL,
      type        TEXT    NOT NULL,
      props       TEXT    NOT NULL,
      source      TEXT    NOT NULL
    )`,

    `CREATE INDEX idx_layout_elements_layout
      ON layout_elements(layout_id, sort_order)`,

    `CREATE TABLE print_data (
      id          TEXT PRIMARY KEY,
      layout_id   TEXT    NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
      title       TEXT    NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    )`,

    `CREATE INDEX idx_print_data_layout ON print_data(layout_id)`,

    `CREATE TABLE print_data_values (
      print_data_id TEXT NOT NULL REFERENCES print_data(id) ON DELETE CASCADE,
      field_id      TEXT NOT NULL REFERENCES layout_fields(id) ON DELETE CASCADE,
      text_value    TEXT,
      asset_id      TEXT REFERENCES image_assets(id) ON DELETE SET NULL,
      PRIMARY KEY (print_data_id, field_id)
    )`,
  ],
}
