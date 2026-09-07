import { beforeEach, describe, expect, it } from '@jest/globals'
import { findAllLayouts } from '../repositories/layoutRepository'
import { findAllPrintData } from '../repositories/printDataRepository'
import { seedPresets } from '../seedPresets'
import {
  createMigratedTestConnection,
  type TestConnection,
} from './testConnection'

let db: TestConnection

beforeEach(async () => {
  db = await createMigratedTestConnection()
})

describe('seedPresets', () => {
  it('レイアウトと印刷データを保存する', async () => {
    await seedPresets(db)

    const layouts = await findAllLayouts(db)
    const printData = await findAllPrintData(db)

    expect(layouts.map(({ name }) => name)).toEqual(['名刺'])
    expect(printData.map(({ title }) => title).sort()).toEqual(
      ['サンプル', '開発者紹介'].sort(),
    )
  })

  it('読み戻したレイアウトの差し込み口と要素がそろっている', async () => {
    await seedPresets(db)

    const [layout] = await findAllLayouts(db)

    expect(layout.fields.length).toBeGreaterThan(0)
    expect(layout.elements.length).toBeGreaterThan(0)
  })

  it('読み戻した印刷データが値を持つ', async () => {
    await seedPresets(db)

    const printData = await findAllPrintData(db)
    const sample = printData.find(({ title }) => title === 'サンプル')

    expect(Object.keys(sample?.values ?? {}).length).toBeGreaterThan(0)
  })

  it('画像を持つ印刷データを読み戻せる', async () => {
    await seedPresets(db)

    const printData = await findAllPrintData(db)
    const images = Object.values(printData[0].values).filter(
      (value) => value?.kind === 'image',
    )

    expect(images.length).toBeGreaterThan(0)
  })
})
