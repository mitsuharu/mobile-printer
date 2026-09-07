import { describe, expect, it } from '@jest/globals'
import { buildPrintCommands, type Layout } from '@/print'
import { createPreviewPrintData } from '../previewData'

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [
    { id: 'field-1', key: 'name', label: '名前', valueType: 'text' },
    { id: 'field-2', key: 'icon', label: '', valueType: 'image' },
  ],
  elements: [
    {
      id: 'text-1',
      type: 'text',
      source: { kind: 'field', fieldId: 'field-1' },
      fontSize: 24,
      bold: false,
      underline: false,
      alignment: 'center',
      hideWhenEmpty: true,
    },
  ],
  createdAt: 0,
  updatedAt: 0,
}

describe('createPreviewPrintData', () => {
  it('文字の入力項目へ表示名を仮の値として入れる', () => {
    expect(createPreviewPrintData(layout).values['field-1']).toEqual({
      kind: 'text',
      value: '［名前］',
    })
  })

  it('表示名が空ならキーを使う', () => {
    const value = createPreviewPrintData({
      ...layout,
      fields: [{ id: 'field-3', key: 'company', label: '', valueType: 'text' }],
    }).values['field-3']
    expect(value).toEqual({ kind: 'text', value: '［company］' })
  })

  it('画像の入力項目には仮の値を入れない', () => {
    expect(createPreviewPrintData(layout).values['field-2']).toBeUndefined()
  })

  it('仮の値のおかげで、入力項目を参照する要素もプレビューに現れる', () => {
    const commands = buildPrintCommands(layout, createPreviewPrintData(layout))
    expect(commands).toContainEqual({ type: 'printText', text: '［名前］' })
  })

  it('印刷データがなければ入力項目を参照する要素は消える', () => {
    expect(buildPrintCommands(layout)).toEqual([])
  })
})
