/**
 * テストで使う Node 同梱 SQLite の型
 *
 * @note
 * `@types/node` を tsconfig の `types` へ足すと、アプリのコードからも Node の
 * グローバルが見えてしまう。テストで使う範囲だけをここで宣言する。
 */
declare module 'node:sqlite' {
  type SQLInputValue = string | number | bigint | null | Uint8Array
  type SQLOutputValue = string | number | bigint | null | Uint8Array

  export class StatementSync {
    all(...params: SQLInputValue[]): Record<string, SQLOutputValue>[]
    get(...params: SQLInputValue[]): Record<string, SQLOutputValue> | undefined
    run(...params: SQLInputValue[]): {
      changes: number | bigint
      lastInsertRowid: number | bigint
    }
  }

  export class DatabaseSync {
    constructor(path: string)
    exec(sql: string): void
    prepare(sql: string): StatementSync
    close(): void
  }
}
