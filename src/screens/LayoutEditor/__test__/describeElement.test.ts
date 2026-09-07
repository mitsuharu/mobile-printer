import { describe, expect, it } from '@jest/globals'
import type { Layout, LayoutElement, TextSource } from '@/print'
import {
  addableElementTypes,
  describeElement,
  describeElementType,
} from '../describeElement'

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [
    { id: 'field-1', key: 'name', label: '名前', valueType: 'text' },
    { id: 'field-2', key: 'icon', label: '', valueType: 'image' },
  ],
  elements: [],
  createdAt: 0,
  updatedAt: 0,
}

const describe1 = (element: LayoutElement) => describeElement(element, layout)

describe('describeElementType', () => {
  it('追加できる種類をすべて日本語で表示する', () => {
    expect(addableElementTypes.map(describeElementType)).toEqual([
      'テキスト',
      '画像',
      'QRコード',
      '列',
      '区切り線',
      '空白',
      '印刷時刻',
    ])
  })
})

describe('describeElement text', () => {
  const text = (source: TextSource): LayoutElement => ({
    id: 'text-1',
    type: 'text',
    source,
    fontSize: 24,
    bold: false,
    underline: false,
    alignment: 'center',
    hideWhenEmpty: true,
  })

  it('固定値はそのまま表示する', () => {
    expect(describe1(text({ kind: 'static', value: '江本光晴' }))).toBe(
      '江本光晴',
    )
  })

  it('固定値が空なら未入力と伝える', () => {
    expect(describe1(text({ kind: 'static', value: '  ' }))).toBe('（未入力）')
  })

  it('差し込みはフィールド名を表示する', () => {
    expect(describe1(text({ kind: 'field', fieldId: 'field-1' }))).toBe(
      '［名前］',
    )
  })

  it('ラベルが空ならキーで表示する', () => {
    expect(describe1(text({ kind: 'field', fieldId: 'field-2' }))).toBe(
      '［icon］',
    )
  })

  it('参照先がなければそれと分かるようにする', () => {
    expect(describe1(text({ kind: 'field', fieldId: 'missing' }))).toBe(
      '［参照先なし］',
    )
  })
})

describe('describeElement 各種', () => {
  it('画像を選んでいなければ伝える', () => {
    expect(
      describe1({
        id: 'image-1',
        type: 'image',
        source: { kind: 'static' },
        width: 200,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      }),
    ).toBe('（画像未選択）')
  })

  it('画像を選んでいれば幅を伝える', () => {
    expect(
      describe1({
        id: 'image-1',
        type: 'image',
        source: {
          kind: 'static',
          asset: {
            id: 'a',
            base64: 'AAAA',
            width: 200,
            imageType: 'binary',
          },
        },
        width: 384,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      }),
    ).toBe('幅384px')
  })

  it('列は各列の内容を並べる', () => {
    expect(
      describe1({
        id: 'columns-1',
        type: 'columns',
        columns: [
          {
            source: { kind: 'static', value: 'X:' },
            width: 10,
            alignment: 'left',
          },
          {
            source: { kind: 'field', fieldId: 'field-1' },
            width: 22,
            alignment: 'left',
          },
        ],
        hideWhenEmpty: true,
      }),
    ).toBe('X: / ［名前］')
  })

  it('区切り線は線種を日本語で表示する', () => {
    expect(describe1({ id: 'd', type: 'divider', barType: 'wave' })).toBe(
      '波線',
    )
  })

  it('空白は行数を表示する', () => {
    expect(describe1({ id: 's', type: 'spacer', lines: 2 })).toBe('2行')
  })

  it('印刷時刻は書式を表示する', () => {
    expect(
      describe1({
        id: 't',
        type: 'timestamp',
        format: 'YYYY/MM/DD HH:mm',
        alignment: 'right',
      }),
    ).toBe('YYYY/MM/DD HH:mm')
  })
})
