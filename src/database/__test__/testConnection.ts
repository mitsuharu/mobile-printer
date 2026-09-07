import { DatabaseSync } from 'node:sqlite'
import { migrate } from '../migrate'
import type { QueryResult, Scalar, SqliteConnection } from '../types'

/**
 * Node 同梱の SQLite を `SqliteConnection` として使えるようにする
 *
 * op-sqlite は実機でしか動かないため、テストではこちらを使い、
 * 実際のスキーマとSQLに対してリポジトリを検証する。
 */
export type TestConnection = SqliteConnection & {
  /**
   * 実行したSQL（検証用）
   */
  executed: string[]
}

const toScalar = (value: Scalar | undefined) => {
  if (value === undefined || value === null) {
    return null
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  return value as string | number
}

export const createTestConnection = (): TestConnection => {
  const db = new DatabaseSync(':memory:')
  const executed: string[] = []

  const run = async (
    query: string,
    params: Scalar[] = [],
  ): Promise<QueryResult> => {
    executed.push(query)
    const bound = params.map(toScalar)

    // PRAGMA と DDL は prepare できないものがあるため、値を伴わない文は exec で流す
    if (bound.length === 0 && /^\s*(CREATE|DROP|BEGIN|COMMIT)/i.test(query)) {
      db.exec(query)
      return { rowsAffected: 0, rows: [] }
    }

    const statement = db.prepare(query)
    if (/^\s*SELECT|^\s*PRAGMA\s+\w+\s*$/i.test(query)) {
      return {
        rowsAffected: 0,
        rows: statement.all(...bound) as QueryResult['rows'],
      }
    }

    const result = statement.run(...bound)
    return {
      rowsAffected: Number(result.changes),
      rows: [],
      insertId: Number(result.lastInsertRowid),
    }
  }

  return {
    executed,
    execute: run,
    executeBatch: async (commands) => {
      for (const [query, params] of commands) {
        await run(query, params as Scalar[])
      }
      return { rowsAffected: commands.length }
    },
    transaction: async (fn) => {
      db.exec('BEGIN')
      try {
        await fn({ execute: run })
        db.exec('COMMIT')
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    },
    close: () => db.close(),
  }
}

/**
 * マイグレーションを適用済みの接続を作る
 */
export const createMigratedTestConnection =
  async (): Promise<TestConnection> => {
    const db = createTestConnection()
    await db.execute('PRAGMA foreign_keys = ON')
    await migrate(db)
    return db
  }
