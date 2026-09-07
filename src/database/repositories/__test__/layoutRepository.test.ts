import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ImageAsset, Layout, LayoutElement } from '@/print'
import {
  createMigratedTestConnection,
  type TestConnection,
} from '../../__test__/testConnection'
import {
  collectLayoutAssetIds,
  deleteLayout,
  findAllLayouts,
  findLayoutById,
  saveLayout,
} from '../layoutRepository'

const asset: ImageAsset = {
  id: 'asset-1',
  path: '/images/asset-1.png',
  width: 200,
  imageType: 'binary',
}

const allElements: LayoutElement[] = [
  {
    id: 'text-1',
    type: 'text',
    source: { kind: 'field', fieldId: 'field-1' },
    fontSize: 32,
    bold: true,
    underline: false,
    alignment: 'center',
    hideWhenEmpty: true,
  },
  {
    id: 'image-1',
    type: 'image',
    source: { kind: 'static', asset },
    width: 200,
    imageType: 'binary',
    alignment: 'center',
    hideWhenEmpty: true,
  },
  {
    id: 'qr-1',
    type: 'qrcode',
    source: { kind: 'static', value: 'https://example.com/' },
    moduleSize: 8,
    errorLevel: 'low',
    alignment: 'center',
    hideWhenEmpty: true,
  },
  {
    id: 'columns-1',
    type: 'columns',
    columns: [
      { source: { kind: 'static', value: 'X:' }, width: 10, alignment: 'left' },
      {
        source: { kind: 'field', fieldId: 'field-1' },
        width: 22,
        alignment: 'left',
      },
    ],
    hideWhenEmpty: true,
  },
  { id: 'divider-1', type: 'divider', barType: 'wave' },
  { id: 'spacer-1', type: 'spacer', lines: 2 },
  {
    id: 'timestamp-1',
    type: 'timestamp',
    format: 'YYYY/MM/DD HH:mm',
    alignment: 'right',
  },
]

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [
    { id: 'field-1', key: 'name', label: '名前', valueType: 'text' },
    { id: 'field-2', key: 'icon', label: 'アイコン', valueType: 'image' },
  ],
  elements: allElements,
  createdAt: 100,
  updatedAt: 100,
}

/**
 * 要素とフィールドのIDはレイアウトを跨いで一意なので、
 * 別レイアウトとして保存するときは振り直す
 */
const withLayoutId = (id: string, elements = allElements): Layout => ({
  ...layout,
  id,
  fields: layout.fields.map((field) => ({
    ...field,
    id: `${id}-${field.id}`,
  })),
  elements: elements.map((element) => ({
    ...element,
    id: `${id}-${element.id}`,
  })),
})

let db: TestConnection

beforeEach(async () => {
  db = await createMigratedTestConnection()
})

describe('saveLayout / findLayoutById', () => {
  it('すべての要素種別を保存して同じ内容で読み戻せる', async () => {
    await saveLayout(db, layout)

    const loaded = await findLayoutById(db, layout.id)

    expect(loaded?.elements).toEqual(allElements)
  })

  it('フィールドを並び順どおりに読み戻す', async () => {
    await saveLayout(db, layout)

    const loaded = await findLayoutById(db, layout.id)

    expect(loaded?.fields).toEqual(layout.fields)
  })

  it('要素の並び順を保つ', async () => {
    const reordered: Layout = {
      ...layout,
      elements: [...allElements].reverse(),
    }
    await saveLayout(db, reordered)

    const loaded = await findLayoutById(db, layout.id)

    expect(loaded?.elements.map(({ id }) => id)).toEqual(
      [...allElements].reverse().map(({ id }) => id),
    )
  })

  it('保存し直すと updatedAt が進み、createdAt は残る', async () => {
    const saved = await saveLayout(db, { ...layout, updatedAt: 0 })

    expect(saved.createdAt).toBe(100)
    expect(saved.updatedAt).toBeGreaterThan(100)

    const loaded = await findLayoutById(db, layout.id)
    expect(loaded?.updatedAt).toBe(saved.updatedAt)
  })

  it('保存し直したときに要素が重複しない', async () => {
    await saveLayout(db, layout)
    await saveLayout(db, {
      ...layout,
      elements: [allElements[0]],
      fields: [layout.fields[0]],
    })

    const loaded = await findLayoutById(db, layout.id)

    expect(loaded?.elements).toHaveLength(1)
    expect(loaded?.fields).toHaveLength(1)
  })

  it('固定の画像を保存して読み戻せる', async () => {
    await saveLayout(db, layout)

    const loaded = await findLayoutById(db, layout.id)
    const image = loaded?.elements.find(({ type }) => type === 'image')

    expect(image?.type === 'image' && image.source).toEqual({
      kind: 'static',
      asset,
    })
  })

  it('画像を選んでいない要素も保存できる', async () => {
    await saveLayout(db, {
      ...layout,
      elements: [
        {
          id: 'image-2',
          type: 'image',
          source: { kind: 'static' },
          width: 200,
          imageType: 'binary',
          alignment: 'center',
          hideWhenEmpty: true,
        },
      ],
    })

    const loaded = await findLayoutById(db, layout.id)

    expect(loaded?.elements[0]).toEqual({
      id: 'image-2',
      type: 'image',
      source: { kind: 'static', asset: undefined },
      width: 200,
      imageType: 'binary',
      alignment: 'center',
      hideWhenEmpty: true,
    })
  })

  it('存在しないIDは undefined を返す', async () => {
    await expect(findLayoutById(db, 'missing')).resolves.toBeUndefined()
  })
})

describe('findAllLayouts', () => {
  it('レイアウトがなければ空を返す', async () => {
    await expect(findAllLayouts(db)).resolves.toEqual([])
  })

  it('更新が新しい順に並べる', async () => {
    await saveLayout(db, { ...withLayoutId('a'), name: 'A' })
    await db.execute('UPDATE layouts SET updated_at = ? WHERE id = ?', [1, 'a'])
    await saveLayout(db, { ...withLayoutId('b'), name: 'B' })

    const layouts = await findAllLayouts(db)

    expect(layouts.map(({ id }) => id)).toEqual(['b', 'a'])
  })

  it('レイアウトごとに自分の要素だけを持つ', async () => {
    await saveLayout(db, withLayoutId('a', [allElements[0]]))
    await saveLayout(db, withLayoutId('b'))

    const layouts = await findAllLayouts(db)
    const byId = new Map(layouts.map((value) => [value.id, value]))

    expect(byId.get('a')?.elements).toHaveLength(1)
    expect(byId.get('b')?.elements).toHaveLength(allElements.length)
  })
})

describe('deleteLayout', () => {
  it('レイアウトと、紐づくフィールド・要素をまとめて消す', async () => {
    await saveLayout(db, layout)
    await deleteLayout(db, layout.id)

    await expect(findLayoutById(db, layout.id)).resolves.toBeUndefined()

    const fields = await db.execute('SELECT * FROM layout_fields')
    const elements = await db.execute('SELECT * FROM layout_elements')
    expect(fields.rows).toEqual([])
    expect(elements.rows).toEqual([])
  })

  it('ほかのレイアウトは残す', async () => {
    await saveLayout(db, withLayoutId('a'))
    await saveLayout(db, withLayoutId('b'))

    await deleteLayout(db, 'a')

    expect((await findAllLayouts(db)).map(({ id }) => id)).toEqual(['b'])
  })
})

describe('collectLayoutAssetIds', () => {
  it('固定の画像として参照しているIDを重複なく集める', () => {
    expect(collectLayoutAssetIds([layout, layout])).toEqual(['asset-1'])
  })

  it('画像を持たないレイアウトでは空になる', () => {
    expect(
      collectLayoutAssetIds([{ ...layout, elements: [allElements[0]] }]),
    ).toEqual([])
  })
})
