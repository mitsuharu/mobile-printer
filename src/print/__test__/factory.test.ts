import { describe, expect, it } from '@jest/globals'
import { buildPrintCommands } from '../buildPrintCommands'
import {
  createLayout,
  createLayoutElement,
  createPrintData,
  duplicateLayout,
} from '../factory'
import type { Layout, LayoutElementType } from '../types'

const elementTypes: LayoutElementType[] = [
  'text',
  'image',
  'qrcode',
  'columns',
  'divider',
  'spacer',
  'timestamp',
]

describe('createLayoutElement', () => {
  it.each(elementTypes)('%s 要素をIDつきで作る', (type) => {
    const element = createLayoutElement(type)
    expect(element.type).toBe(type)
    expect(element.id).not.toBe('')
  })

  it('呼ぶたびに異なるIDを振る', () => {
    expect(createLayoutElement('text').id).not.toBe(
      createLayoutElement('text').id,
    )
  })
})

describe('createLayout', () => {
  it('テキスト要素ひとつから始まる', () => {
    const layout = createLayout('名刺')
    expect(layout.name).toBe('名刺')
    expect(layout.fields).toEqual([])
    expect(layout.elements).toHaveLength(1)
    expect(layout.elements[0].type).toBe('text')
  })
})

describe('createPrintData', () => {
  it('レイアウトに紐づく空のデータを作る', () => {
    const printData = createPrintData('layout-1', '織田信長')
    expect(printData.layoutId).toBe('layout-1')
    expect(printData.title).toBe('織田信長')
    expect(printData.values).toEqual({})
  })
})

describe('duplicateLayout', () => {
  const original: Layout = {
    id: 'layout-1',
    name: '名刺',
    fields: [
      { id: 'field-1', key: 'name', label: '名前', valueType: 'text' },
      { id: 'field-2', key: 'icon', label: 'アイコン', valueType: 'image' },
    ],
    elements: [
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
        source: { kind: 'field', fieldId: 'field-2' },
        width: 200,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      },
      {
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
      },
      { id: 'divider-1', type: 'divider', barType: 'line' },
    ],
    createdAt: 1,
    updatedAt: 2,
  }

  it('新しい名前とIDで複製する', () => {
    const copied = duplicateLayout(original, '名刺のコピー')
    expect(copied.name).toBe('名刺のコピー')
    expect(copied.id).not.toBe(original.id)
  })

  it('要素とフィールドのIDを振り直す', () => {
    const copied = duplicateLayout(original, 'コピー')

    expect(copied.elements.map(({ id }) => id)).not.toEqual(
      original.elements.map(({ id }) => id),
    )
    expect(copied.fields.map(({ id }) => id)).not.toEqual(
      original.fields.map(({ id }) => id),
    )
  })

  it('要素からのフィールド参照を新しいIDへ付け替える', () => {
    const copied = duplicateLayout(original, 'コピー')

    const nameFieldId = copied.fields[0].id
    const iconFieldId = copied.fields[1].id

    const text = copied.elements[0]
    const image = copied.elements[1]
    const columns = copied.elements[2]

    expect(text.type === 'text' && text.source).toEqual({
      kind: 'field',
      fieldId: nameFieldId,
    })
    expect(image.type === 'image' && image.source).toEqual({
      kind: 'field',
      fieldId: iconFieldId,
    })
    expect(columns.type === 'columns' && columns.columns[1].source).toEqual({
      kind: 'field',
      fieldId: nameFieldId,
    })
  })

  it('固定値の列はそのまま残す', () => {
    const copied = duplicateLayout(original, 'コピー')
    const columns = copied.elements[2]

    expect(columns.type === 'columns' && columns.columns[0].source).toEqual({
      kind: 'static',
      value: 'X:',
    })
  })

  it('キーやラベルなど、フィールドの中身は保つ', () => {
    const copied = duplicateLayout(original, 'コピー')

    expect(
      copied.fields.map(({ key, label, valueType }) => ({
        key,
        label,
        valueType,
      })),
    ).toEqual([
      { key: 'name', label: '名前', valueType: 'text' },
      { key: 'icon', label: 'アイコン', valueType: 'image' },
    ])
  })

  it('複製したレイアウトは同じ印刷結果になる', () => {
    const printedAt = 0

    const copied = duplicateLayout(original, 'コピー')
    const values = {
      'field-1': { kind: 'text' as const, value: '江本光晴' },
    }
    const copiedValues = { [copied.fields[0].id]: values['field-1'] }

    expect(
      buildPrintCommands(
        copied,
        {
          id: 'p2',
          layoutId: copied.id,
          title: '',
          values: copiedValues,
          createdAt: 0,
          updatedAt: 0,
        },
        { printedAt },
      ),
    ).toEqual(
      buildPrintCommands(
        original,
        {
          id: 'p1',
          layoutId: original.id,
          title: '',
          values,
          createdAt: 0,
          updatedAt: 0,
        },
        { printedAt },
      ),
    )
  })
})
