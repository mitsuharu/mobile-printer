import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ImageAsset, Layout, PrintData } from '@/print'
import {
  createMigratedTestConnection,
  type TestConnection,
} from '../../__test__/testConnection'
import { saveLayout } from '../layoutRepository'
import {
  deletePrintData,
  findAllPrintData,
  findPrintDataByLayoutId,
  savePrintData,
} from '../printDataRepository'

const asset: ImageAsset = {
  id: 'asset-1',
  base64: 'AAAA',
  width: 200,
  imageType: 'binary',
}

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [
    { id: 'field-1', key: 'name', label: '名前', valueType: 'text' },
    { id: 'field-2', key: 'icon', label: 'アイコン', valueType: 'image' },
  ],
  elements: [],
  createdAt: 0,
  updatedAt: 0,
}

const printData: PrintData = {
  id: 'print-1',
  layoutId: layout.id,
  title: '織田信長',
  values: {
    'field-1': { kind: 'text', value: '織田信長' },
    'field-2': { kind: 'image', asset },
  },
  createdAt: 100,
  updatedAt: 100,
}

let db: TestConnection

beforeEach(async () => {
  db = await createMigratedTestConnection()
  await saveLayout(db, layout)
})

describe('savePrintData / findPrintDataByLayoutId', () => {
  it('文字と画像の値を読み戻せる', async () => {
    await savePrintData(db, printData)

    const [loaded] = await findPrintDataByLayoutId(db, layout.id)

    expect(loaded.values).toEqual(printData.values)
  })

  it('保存し直すと updatedAt が進み、createdAt は残る', async () => {
    const saved = await savePrintData(db, { ...printData, updatedAt: 0 })

    expect(saved.createdAt).toBe(100)
    expect(saved.updatedAt).toBeGreaterThan(100)
  })

  it('保存し直したときに値が重複しない', async () => {
    await savePrintData(db, printData)
    await savePrintData(db, {
      ...printData,
      values: { 'field-1': { kind: 'text', value: '豊臣秀吉' } },
    })

    const [loaded] = await findPrintDataByLayoutId(db, layout.id)

    expect(loaded.values).toEqual({
      'field-1': { kind: 'text', value: '豊臣秀吉' },
    })
  })

  it('値が未設定のフィールドは保存しない', async () => {
    await savePrintData(db, {
      ...printData,
      values: { 'field-1': undefined, 'field-2': undefined },
    })

    const rows = await db.execute('SELECT * FROM print_data_values')
    expect(rows.rows).toEqual([])
  })

  it('空文字も値として保存する', async () => {
    await savePrintData(db, {
      ...printData,
      values: { 'field-1': { kind: 'text', value: '' } },
    })

    const [loaded] = await findPrintDataByLayoutId(db, layout.id)
    expect(loaded.values['field-1']).toEqual({ kind: 'text', value: '' })
  })

  it('ほかのレイアウトの印刷データは返さない', async () => {
    await saveLayout(db, { ...layout, id: 'layout-2', fields: [] })
    await savePrintData(db, printData)
    await savePrintData(db, {
      ...printData,
      id: 'print-2',
      layoutId: 'layout-2',
      values: {},
    })

    const loaded = await findPrintDataByLayoutId(db, layout.id)
    expect(loaded.map(({ id }) => id)).toEqual(['print-1'])
  })

  it('更新が新しい順に並べる', async () => {
    await savePrintData(db, printData)
    await db.execute('UPDATE print_data SET updated_at = ? WHERE id = ?', [
      1,
      'print-1',
    ])
    await savePrintData(db, { ...printData, id: 'print-2', values: {} })

    const loaded = await findAllPrintData(db)
    expect(loaded.map(({ id }) => id)).toEqual(['print-2', 'print-1'])
  })
})

describe('deletePrintData', () => {
  it('印刷データと、紐づく値をまとめて消す', async () => {
    await savePrintData(db, printData)
    await deletePrintData(db, printData.id)

    await expect(findAllPrintData(db)).resolves.toEqual([])
    const values = await db.execute('SELECT * FROM print_data_values')
    expect(values.rows).toEqual([])
  })
})

describe('レイアウトとの関係', () => {
  it('レイアウトを消すと印刷データも消える', async () => {
    await savePrintData(db, printData)

    await db.execute('DELETE FROM layouts WHERE id = ?', [layout.id])

    await expect(findAllPrintData(db)).resolves.toEqual([])
  })

  it('レイアウトを保存し直しても、残した入力項目の値は消えない', async () => {
    await savePrintData(db, printData)

    // 名前を変えただけで、入力項目は消していない
    await saveLayout(db, { ...layout, name: '名刺2' })

    const [loaded] = await findAllPrintData(db)
    expect(loaded.values).toEqual(printData.values)
  })

  it('入力項目を編集しても値は消えない', async () => {
    await savePrintData(db, printData)

    await saveLayout(db, {
      ...layout,
      fields: [{ ...layout.fields[0], label: '氏名' }, layout.fields[1]],
    })

    const [loaded] = await findAllPrintData(db)
    expect(loaded.values).toEqual(printData.values)
  })

  it('入力項目の並び順を入れ替えても値は消えない', async () => {
    await savePrintData(db, printData)

    await saveLayout(db, {
      ...layout,
      fields: [layout.fields[1], layout.fields[0]],
    })

    const [loaded] = await findAllPrintData(db)
    expect(loaded.values).toEqual(printData.values)
  })

  it('入力項目を消すと、その値も消える', async () => {
    await savePrintData(db, printData)

    await saveLayout(db, { ...layout, fields: [layout.fields[1]] })

    const [loaded] = await findAllPrintData(db)
    expect(loaded.values).toEqual({ 'field-2': { kind: 'image', asset } })
  })
})
