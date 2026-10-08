import { initialMigration } from './001_initial'
import { imagePathMigration } from './002_image_path'
import { englishPresetsMigration } from './003_english_presets'
import type { Migration } from './types'

export type { Migration }

/**
 * 適用順に並べたマイグレーション
 */
export const migrations: Migration[] = [
  initialMigration,
  imagePathMigration,
  englishPresetsMigration,
]
