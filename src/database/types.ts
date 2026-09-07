import type {
  BatchQueryResult,
  QueryResult,
  Scalar,
  SQLBatchTuple,
} from '@op-engineering/op-sqlite'

export type { QueryResult, Scalar, SQLBatchTuple }

/**
 * トランザクション内で実行できる操作
 */
export type SqliteTransaction = {
  execute: (query: string, params?: Scalar[]) => Promise<QueryResult>
}

/**
 * アプリが利用する SQLite の操作範囲
 *
 * @note
 * op-sqlite の `DB` のうち、このアプリで使うものだけを切り出している。
 * こうしておくと、テストで実装を差し替えられる。
 */
export type SqliteConnection = {
  execute: (query: string, params?: Scalar[]) => Promise<QueryResult>
  executeBatch: (commands: SQLBatchTuple[]) => Promise<BatchQueryResult>
  transaction: (fn: (tx: SqliteTransaction) => Promise<void>) => Promise<void>
  close: () => void
}
