import { describe, expect, it } from '@jest/globals'
import {
  addElement,
  isFieldReferenced,
  moveElement,
  removeElement,
  removeField,
  replaceElement,
  unusedFields,
  upsertField,
} from '../mutations'
import type { Layout, LayoutElement } from '../types'

const text = (id: string): LayoutElement => ({
  id,
  type: 'text',
  source: { kind: 'field', fieldId: 'field-1' },
  fontSize: 24,
  bold: false,
  underline: false,
  alignment: 'center',
  hideWhenEmpty: true,
})

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [
    { id: 'field-1', key: 'name', label: '名前', valueType: 'text' },
    { id: 'field-2', key: 'icon', label: 'アイコン', valueType: 'image' },
  ],
  elements: [
    text('a'),
    { id: 'b', type: 'divider', barType: 'line' },
    { id: 'c', type: 'spacer', lines: 1 },
  ],
  createdAt: 0,
  updatedAt: 0,
}

describe('addElement', () => {
  it('末尾に足す', () => {
    const next = addElement(layout, { id: 'd', type: 'spacer', lines: 2 })
    expect(next.elements.map(({ id }) => id)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('replaceElement', () => {
  it('同じIDの要素を差し替える', () => {
    const next = replaceElement(layout, {
      id: 'b',
      type: 'divider',
      barType: 'wave',
    })
    expect(next.elements[1]).toEqual({
      id: 'b',
      type: 'divider',
      barType: 'wave',
    })
  })

  it('ほかの要素と並び順は変えない', () => {
    const next = replaceElement(layout, {
      id: 'b',
      type: 'divider',
      barType: 'wave',
    })
    expect(next.elements.map(({ id }) => id)).toEqual(['a', 'b', 'c'])
  })

  it('IDが一致しなければ何も変わらない', () => {
    const next = replaceElement(layout, { id: 'x', type: 'spacer', lines: 9 })
    expect(next.elements).toEqual(layout.elements)
  })
})

describe('removeElement', () => {
  it('指定した要素を取り除く', () => {
    expect(removeElement(layout, 'b').elements.map(({ id }) => id)).toEqual([
      'a',
      'c',
    ])
  })
})

describe('moveElement', () => {
  it('前から後ろへ動かす', () => {
    expect(moveElement(layout, 0, 2).elements.map(({ id }) => id)).toEqual([
      'b',
      'c',
      'a',
    ])
  })

  it('後ろから前へ動かす', () => {
    expect(moveElement(layout, 2, 0).elements.map(({ id }) => id)).toEqual([
      'c',
      'a',
      'b',
    ])
  })

  it('同じ位置なら何も変わらない', () => {
    expect(moveElement(layout, 1, 1)).toBe(layout)
  })

  it('範囲の外は何も変わらない', () => {
    expect(moveElement(layout, 0, 5)).toBe(layout)
    expect(moveElement(layout, -1, 0)).toBe(layout)
  })
})

describe('upsertField', () => {
  it('新しい入力項目を足す', () => {
    const next = upsertField(layout, {
      id: 'field-3',
      key: 'qr',
      label: 'QR',
      valueType: 'url',
    })
    expect(next.fields.map(({ id }) => id)).toEqual([
      'field-1',
      'field-2',
      'field-3',
    ])
  })

  it('同じIDなら差し替える', () => {
    const next = upsertField(layout, {
      id: 'field-1',
      key: 'fullName',
      label: '氏名',
      valueType: 'text',
    })
    expect(next.fields).toHaveLength(2)
    expect(next.fields[0].label).toBe('氏名')
  })
})

describe('removeField', () => {
  const withColumns: Layout = {
    ...layout,
    elements: [
      ...layout.elements,
      {
        id: 'd',
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
      {
        id: 'e',
        type: 'image',
        source: { kind: 'field', fieldId: 'field-2' },
        width: 200,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      },
    ],
  }

  it('入力項目を取り除く', () => {
    expect(
      removeField(withColumns, 'field-1').fields.map(({ id }) => id),
    ).toEqual(['field-2'])
  })

  it('参照していた文字の要素を固定値へ戻す', () => {
    const next = removeField(withColumns, 'field-1')
    const element = next.elements[0]
    expect(element.type === 'text' && element.source).toEqual({
      kind: 'static',
      value: '',
    })
  })

  it('参照していた列を固定値へ戻す', () => {
    const next = removeField(withColumns, 'field-1')
    const element = next.elements[3]
    expect(element.type === 'columns' && element.columns[1].source).toEqual({
      kind: 'static',
      value: '',
    })
  })

  it('参照していた画像を画像未選択へ戻す', () => {
    const next = removeField(withColumns, 'field-2')
    const element = next.elements[4]
    expect(element.type === 'image' && element.source).toEqual({
      kind: 'static',
    })
  })

  it('ほかの入力項目への参照は残す', () => {
    const next = removeField(withColumns, 'field-2')
    const element = next.elements[0]
    expect(element.type === 'text' && element.source).toEqual({
      kind: 'field',
      fieldId: 'field-1',
    })
  })

  it('固定値の列はそのまま残す', () => {
    const next = removeField(withColumns, 'field-1')
    const element = next.elements[3]
    expect(element.type === 'columns' && element.columns[0].source).toEqual({
      kind: 'static',
      value: 'X:',
    })
  })
})

describe('isFieldReferenced', () => {
  it('参照している要素があれば true', () => {
    expect(isFieldReferenced(layout, 'field-1')).toBe(true)
  })

  it('参照している要素がなければ false', () => {
    expect(isFieldReferenced(layout, 'field-2')).toBe(false)
  })
})

describe('unusedFields', () => {
  it('どの要素からも参照されていない項目だけを返す', () => {
    expect(unusedFields(layout).map(({ id }) => id)).toEqual(['field-2'])
  })

  it('すべて参照されていれば空になる', () => {
    const next: Layout = { ...layout, fields: [layout.fields[0]] }
    expect(unusedFields(next)).toEqual([])
  })

  it('要素の供給元をレイアウト固定へ変えると未使用になる', () => {
    const staticText: LayoutElement = {
      id: 'a',
      type: 'text',
      source: { kind: 'static', value: '織田信長' },
      fontSize: 24,
      bold: false,
      underline: false,
      alignment: 'center',
      hideWhenEmpty: true,
    }
    const next = replaceElement(layout, staticText)
    expect(unusedFields(next).map(({ id }) => id)).toEqual([
      'field-1',
      'field-2',
    ])
  })
})
