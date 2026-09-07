/**
 * スキーマの変更ひとまとまり
 *
 * `version` は 1 から始まる連番で、適用済みのバージョンは `PRAGMA user_version` に記録する。
 * 一度リリースしたマイグレーションの `statements` は書き換えず、常に新しい `version` を追加する。
 */
export type Migration = {
  version: number
  statements: string[]
}
