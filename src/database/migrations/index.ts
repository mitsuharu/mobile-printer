import { initialMigration } from './001_initial'
import { imagePathMigration } from './002_image_path'
import type { Migration } from './types'

export type { Migration }

/**
 * 適用順に並べたマイグレーション
 */
export const migrations: Migration[] = [initialMigration, imagePathMigration]
