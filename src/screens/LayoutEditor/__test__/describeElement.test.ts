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
  it('shows all available element types in English', () => {
    expect(addableElementTypes.map(describeElementType)).toEqual([
      'Text',
      'Image',
      'QR code',
      'Columns',
      'Divider',
      'Blank space',
      'Print timestamp',
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
    expect(describe1(text({ kind: 'static', value: '  ' }))).toBe('(empty)')
  })

  it('入力項目を参照するときは項目名を表示する', () => {
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
      '[missing field]',
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
    ).toBe('(no image selected)')
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
            path: '/images/asset-1.png',
            width: 200,
            imageType: 'binary',
          },
        },
        width: 384,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      }),
    ).toBe('Width: 384px')
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

  it('shows the divider style in English', () => {
    expect(describe1({ id: 'd', type: 'divider', barType: 'wave' })).toBe(
      'Wavy line',
    )
  })

  it('空白は行数を表示する', () => {
    expect(describe1({ id: 's', type: 'spacer', lines: 2 })).toBe('2 lines')
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
