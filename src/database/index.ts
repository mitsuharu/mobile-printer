import { open } from '@op-engineering/op-sqlite'
import { DATABASE_NAME } from './constants'
import { migrate, readSchemaVersion } from './migrate'
import type { SqliteConnection } from './types'

export * from './constants'
export * from './migrate'
export * from './migrations'
export * from './repositories'
export * from './seedPresets'
export * from './types'

let connection: SqliteConnection | undefined

export type InitializeDatabaseResult = {
  connection: SqliteConnection

  /**
   * このとき初めてデータベースを作ったか
   *
   * プリセットを入れるのは作った直後の一度だけにする。
   */
  isCreated: boolean
}

/**
 * データベースを開いて、未適用のマイグレーションを適用する
 *
 * 2回目以降は開いている接続をそのまま返す。
 */
export const initializeDatabase =
  async (): Promise<InitializeDatabaseResult> => {
    if (connection) {
      return { connection, isCreated: false }
    }

    const db = open({ name: DATABASE_NAME })

    // 外部キー制約は接続ごとに有効化する必要がある
    await db.execute('PRAGMA foreign_keys = ON')

    const isCreated = (await readSchemaVersion(db)) === 0
    await migrate(db)

    connection = db
    return { connection: db, isCreated }
  }

/**
 * 開いている接続を返す
 *
 * @throws 初期化前に呼ばれた場合
 */
export const getDatabase = (): SqliteConnection => {
  if (!connection) {
    throw new Error('database is not initialized')
  }
  return connection
}

/**
 * 接続を閉じる
 */
export const closeDatabase = (): void => {
  connection?.close()
  connection = undefined
}
