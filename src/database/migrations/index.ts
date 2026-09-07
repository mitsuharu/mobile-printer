import { initialMigration } from './001_initial'
import type { Migration } from './types'

export type { Migration }

/**
 * 適用順に並べたマイグレーション
 */
export const migrations: Migration[] = [initialMigration]
