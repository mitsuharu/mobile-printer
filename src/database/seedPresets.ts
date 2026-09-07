import { createPresets } from '@/print'
import { saveImageFile } from '@/utils/imageStore'
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
  const { layouts, printData, images } = createPresets()

  // 同梱の画像はファイルへ書き出し、そのパスを印刷データへ埋める
  const paths = new Map<string, string>()
  for (const image of images) {
    paths.set(image.id, await saveImageFile(image.id, image.base64))
  }

  for (const layout of layouts) {
    await saveLayout(db, layout)
  }

  for (const value of printData) {
    await savePrintData(db, {
      ...value,
      values: Object.fromEntries(
        Object.entries(value.values).map(([fieldId, printDataValue]) => [
          fieldId,
          printDataValue?.kind === 'image'
            ? {
                ...printDataValue,
                asset: {
                  ...printDataValue.asset,
                  path: paths.get(printDataValue.asset.id) ?? '',
                },
              }
            : printDataValue,
        ]),
      ),
    })
  }
}
