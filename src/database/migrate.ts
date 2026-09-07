import { migrations as defaultMigrations, type Migration } from './migrations'
import type { SqliteConnection } from './types'

/**
 * 適用済みのスキーマバージョンを読む
 *
 * @package
 */
export const readSchemaVersion = async (
  db: SqliteConnection,
): Promise<number> => {
  const result = await db.execute('PRAGMA user_version')
  const value = result.rows[0]?.user_version
  return typeof value === 'number' ? value : 0
}

const assertVersion = (version: number) => {
  if (!Number.isSafeInteger(version) || version <= 0) {
    // PRAGMA はプレースホルダーを使えず値を埋め込むため、整数であることを保証する
    throw new Error(`invalid migration version: ${version}`)
  }
}

const sortByVersion = (values: Migration[]): Migration[] =>
  [...values].sort((a, b) => a.version - b.version)

/**
 * 未適用のマイグレーションを順に適用する
 *
 * それぞれのマイグレーションは1つのトランザクションで実行し、
 * 成功したときだけ `PRAGMA user_version` を進める。
 *
 * @returns 適用後のスキーマバージョン
 */
export const migrate = async (
  db: SqliteConnection,
  values: Migration[] = defaultMigrations,
): Promise<number> => {
  const sorted = sortByVersion(values)
  for (const { version } of sorted) {
    assertVersion(version)
  }

  let currentVersion = await readSchemaVersion(db)

  for (const migration of sorted) {
    if (migration.version <= currentVersion) {
      continue
    }

    await db.transaction(async (tx) => {
      for (const statement of migration.statements) {
        await tx.execute(statement)
      }
      await tx.execute(`PRAGMA user_version = ${migration.version}`)
    })

    currentVersion = migration.version
  }

  return currentVersion
}

/**
 * マイグレーションをすべて適用したときのスキーマバージョン
 */
export const latestSchemaVersion = (
  values: Migration[] = defaultMigrations,
): number => values.reduce((max, { version }) => Math.max(max, version), 0)
