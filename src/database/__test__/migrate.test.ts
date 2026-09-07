import { describe, expect, it } from '@jest/globals'
import { latestSchemaVersion, migrate, readSchemaVersion } from '../migrate'
import type { Migration } from '../migrations'
import { migrations } from '../migrations'
import type { QueryResult, Scalar, SqliteConnection } from '../types'

type FakeConnection = SqliteConnection & {
  executed: string[]
  committed: number
}

/**
 * `PRAGMA user_version` の読み書きだけを再現する接続
 *
 * トランザクションが最後まで通ったときに限り、`user_version` を確定させる。
 */
const createFakeConnection = (initialVersion = 0): FakeConnection => {
  let version = initialVersion
  let pendingVersion: number | undefined
  const executed: string[] = []
  const state = { committed: 0 }

  const run = async (
    query: string,
    _params?: Scalar[],
  ): Promise<QueryResult> => {
    executed.push(query)

    if (query === 'PRAGMA user_version') {
      return { rowsAffected: 0, rows: [{ user_version: version }] }
    }

    const assignment = query.match(/^PRAGMA user_version = (\d+)$/)
    if (assignment) {
      pendingVersion = Number(assignment[1])
    }

    return { rowsAffected: 0, rows: [] }
  }

  return {
    executed,
    get committed() {
      return state.committed
    },
    execute: run,
    executeBatch: async () => ({ rowsAffected: 0 }),
    transaction: async (fn) => {
      pendingVersion = undefined
      await fn({ execute: run })
      if (pendingVersion !== undefined) {
        version = pendingVersion
        pendingVersion = undefined
      }
      state.committed += 1
    },
    close: () => {},
  }
}

const fixtures: Migration[] = [
  { version: 1, statements: ['CREATE TABLE a (id TEXT)'] },
  { version: 2, statements: ['CREATE TABLE b (id TEXT)'] },
]

describe('readSchemaVersion', () => {
  it('未初期化のデータベースは 0 を返す', async () => {
    const db = createFakeConnection()
    await expect(readSchemaVersion(db)).resolves.toBe(0)
  })

  it('適用済みのバージョンを返す', async () => {
    const db = createFakeConnection(2)
    await expect(readSchemaVersion(db)).resolves.toBe(2)
  })
})

describe('migrate', () => {
  it('未適用のマイグレーションをすべて適用する', async () => {
    const db = createFakeConnection()

    await expect(migrate(db, fixtures)).resolves.toBe(2)

    expect(db.executed).toEqual([
      'PRAGMA user_version',
      'CREATE TABLE a (id TEXT)',
      'PRAGMA user_version = 1',
      'CREATE TABLE b (id TEXT)',
      'PRAGMA user_version = 2',
    ])
  })

  it('マイグレーションごとにトランザクションを分ける', async () => {
    const db = createFakeConnection()

    await migrate(db, fixtures)

    expect(db.committed).toBe(fixtures.length)
  })

  it('適用済みのマイグレーションは実行しない', async () => {
    const db = createFakeConnection(1)

    await expect(migrate(db, fixtures)).resolves.toBe(2)

    expect(db.executed).toEqual([
      'PRAGMA user_version',
      'CREATE TABLE b (id TEXT)',
      'PRAGMA user_version = 2',
    ])
  })

  it('最新まで適用済みなら何も実行しない', async () => {
    const db = createFakeConnection(2)

    await expect(migrate(db, fixtures)).resolves.toBe(2)

    expect(db.executed).toEqual(['PRAGMA user_version'])
    expect(db.committed).toBe(0)
  })

  it('順序が前後していてもバージョン順に適用する', async () => {
    const db = createFakeConnection()

    await migrate(db, [fixtures[1], fixtures[0]])

    expect(db.executed).toEqual([
      'PRAGMA user_version',
      'CREATE TABLE a (id TEXT)',
      'PRAGMA user_version = 1',
      'CREATE TABLE b (id TEXT)',
      'PRAGMA user_version = 2',
    ])
  })

  it('バージョンが不正なら適用しない', async () => {
    const db = createFakeConnection()

    await expect(
      migrate(db, [{ version: 0, statements: ['CREATE TABLE a (id TEXT)'] }]),
    ).rejects.toThrow('invalid migration version: 0')

    expect(db.executed).toEqual([])
  })
})

describe('migrations', () => {
  it('バージョンが 1 から始まる重複のない連番である', () => {
    const versions = migrations.map(({ version }) => version)
    expect(versions).toEqual(versions.map((_, index) => index + 1))
  })

  it('latestSchemaVersion が最大のバージョンを返す', () => {
    expect(latestSchemaVersion()).toBe(migrations.length)
    expect(latestSchemaVersion(fixtures)).toBe(2)
  })
})
