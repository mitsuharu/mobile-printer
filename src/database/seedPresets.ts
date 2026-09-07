import { createPresets } from '@/print'
import { saveLayout } from './repositories/layoutRepository'
import { savePrintData } from './repositories/printDataRepository'
import type { SqliteConnection } from './types'

/**
 * 初回起動時に、プリセットのレイアウトと印刷データを入れる
 *
 * データベースを作った直後にだけ呼ぶ。利用者がすべて削除したあとに
 * 作り直さないよう、レイアウトの有無では判断しない。
 */
export const seedPresets = async (db: SqliteConnection): Promise<void> => {
  const { layouts, printData } = createPresets()

  for (const layout of layouts) {
    await saveLayout(db, layout)
  }
  for (const value of printData) {
    await savePrintData(db, value)
  }
}
