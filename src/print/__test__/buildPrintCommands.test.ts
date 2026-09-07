import { describe, expect, it } from '@jest/globals'
import { buildPrintCommands, FEED_LINE_COUNT } from '../buildPrintCommands'
import type {
  ImageAsset,
  Layout,
  LayoutElement,
  PrintData,
  PrintDataValue,
} from '../types'

const PRINTED_AT = new Date('2026-09-07T21:34:00+09:00').getTime()

const asset: ImageAsset = {
  id: 'asset-1',
  base64: 'AAAA',
  width: 200,
  imageType: 'binary',
}

const createLayout = (elements: LayoutElement[]): Layout => ({
  id: 'layout-1',
  name: 'テスト',
  fields: [],
  elements,
  createdAt: 0,
  updatedAt: 0,
})

const createPrintData = (
  values: Record<string, PrintDataValue | undefined>,
): PrintData => ({
  id: 'print-1',
  layoutId: 'layout-1',
  title: 'テスト',
  values,
  createdAt: 0,
  updatedAt: 0,
})

const textElement = (
  overrides: Partial<Extract<LayoutElement, { type: 'text' }>> = {},
): LayoutElement => ({
  id: 'text-1',
  type: 'text',
  source: { kind: 'static', value: '江本光晴' },
  fontSize: 24,
  bold: false,
  underline: false,
  alignment: 'center',
  hideWhenEmpty: true,
  ...overrides,
})

const build = (elements: LayoutElement[], printData?: PrintData) =>
  buildPrintCommands(createLayout(elements), printData, {
    printedAt: PRINTED_AT,
  })

describe('buildPrintCommands', () => {
  it('要素がなければ何も出力しない', () => {
    expect(build([])).toEqual([])
  })

  it('末尾に紙送りを付ける', () => {
    const commands = build([textElement()])
    expect(commands[commands.length - 1]).toEqual({
      type: 'lineWrap',
      count: FEED_LINE_COUNT,
    })
  })

  it('すべての要素が省略されたら紙送りも出力しない', () => {
    expect(
      build([textElement({ source: { kind: 'static', value: '' } })]),
    ).toEqual([])
  })

  it('要素の並び順どおりに出力する', () => {
    const commands = build([
      { id: 'divider-1', type: 'divider', barType: 'line' },
      { id: 'spacer-1', type: 'spacer', lines: 2 },
    ])

    expect(commands).toEqual([
      { type: 'printHR', barType: 'line' },
      { type: 'lineWrap', count: 2 },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })
})

describe('buildPrintCommands text要素', () => {
  it('書式を明示してから印刷する', () => {
    const commands = build([
      textElement({ fontSize: 32, bold: true, alignment: 'left' }),
    ])

    expect(commands).toEqual([
      { type: 'setAlignment', alignment: 'left' },
      { type: 'setFontSize', size: 32 },
      { type: 'setTextStyle', style: 'bold', enabled: true },
      { type: 'setTextStyle', style: 'underline', enabled: false },
      { type: 'printText', text: '江本光晴' },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })

  it('書式は要素ごとに指定し直す', () => {
    const commands = build([
      textElement({ id: 'a', bold: true }),
      textElement({ id: 'b', bold: false }),
    ])

    expect(
      commands.filter(
        (command) =>
          command.type === 'setTextStyle' && command.style === 'bold',
      ),
    ).toEqual([
      { type: 'setTextStyle', style: 'bold', enabled: true },
      { type: 'setTextStyle', style: 'bold', enabled: false },
    ])
  })

  it('印刷データの値を入れる', () => {
    const commands = build(
      [textElement({ source: { kind: 'field', fieldId: 'field-1' } })],
      createPrintData({ 'field-1': { kind: 'text', value: '織田信長' } }),
    )

    expect(commands).toContainEqual({ type: 'printText', text: '織田信長' })
  })

  it('hideWhenEmpty なら空の値を飛ばす', () => {
    const commands = build(
      [
        textElement({ source: { kind: 'field', fieldId: 'field-1' } }),
        { id: 'spacer-1', type: 'spacer', lines: 1 },
      ],
      createPrintData({}),
    )

    expect(commands).toEqual([
      { type: 'lineWrap', count: 1 },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })

  it('空白だけの値も空とみなす', () => {
    const commands = build(
      [textElement({ source: { kind: 'field', fieldId: 'field-1' } })],
      createPrintData({ 'field-1': { kind: 'text', value: '　 ' } }),
    )

    expect(commands).toEqual([])
  })

  it('hideWhenEmpty が false なら空でも印刷する', () => {
    const commands = build([
      textElement({
        source: { kind: 'field', fieldId: 'field-1' },
        hideWhenEmpty: false,
      }),
    ])

    expect(commands).toContainEqual({ type: 'printText', text: '' })
  })

  it('画像の値が入ったフィールドを参照しても文字としては扱わない', () => {
    const commands = build(
      [textElement({ source: { kind: 'field', fieldId: 'field-1' } })],
      createPrintData({ 'field-1': { kind: 'image', asset } }),
    )

    expect(commands).toEqual([])
  })
})

describe('buildPrintCommands image要素', () => {
  const imageElement = (
    overrides: Partial<Extract<LayoutElement, { type: 'image' }>> = {},
  ): LayoutElement => ({
    id: 'image-1',
    type: 'image',
    source: { kind: 'static', asset },
    width: 200,
    imageType: 'binary',
    alignment: 'center',
    hideWhenEmpty: true,
    ...overrides,
  })

  it('要素側の幅と種別で印刷する', () => {
    const commands = build([
      imageElement({ width: 384, imageType: 'grayscale' }),
    ])

    expect(commands).toEqual([
      { type: 'setAlignment', alignment: 'center' },
      {
        type: 'printImage',
        base64: 'AAAA',
        width: 384,
        imageType: 'grayscale',
      },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })

  it('印刷データの画像を入れる', () => {
    const commands = build(
      [imageElement({ source: { kind: 'field', fieldId: 'field-1' } })],
      createPrintData({ 'field-1': { kind: 'image', asset } }),
    )

    expect(commands).toContainEqual({
      type: 'printImage',
      base64: 'AAAA',
      width: 200,
      imageType: 'binary',
    })
  })

  it('参照するフィールドが空なら hideWhenEmpty によらず飛ばす', () => {
    const commands = build([
      imageElement({
        source: { kind: 'field', fieldId: 'field-1' },
        hideWhenEmpty: false,
      }),
    ])

    expect(commands).toEqual([])
  })

  it('画像を選んでいない固定の要素は飛ばす', () => {
    const commands = build([
      imageElement({ source: { kind: 'static' }, hideWhenEmpty: false }),
    ])

    expect(commands).toEqual([])
  })
})

describe('buildPrintCommands qrcode要素', () => {
  const qrCodeElement = (
    overrides: Partial<Extract<LayoutElement, { type: 'qrcode' }>> = {},
  ): LayoutElement => ({
    id: 'qr-1',
    type: 'qrcode',
    source: { kind: 'static', value: 'https://example.com/' },
    moduleSize: 8,
    errorLevel: 'low',
    alignment: 'center',
    hideWhenEmpty: true,
    ...overrides,
  })

  it('設定どおりに印刷する', () => {
    const commands = build([
      qrCodeElement({ moduleSize: 4, errorLevel: 'high', alignment: 'left' }),
    ])

    expect(commands).toEqual([
      { type: 'setAlignment', alignment: 'left' },
      {
        type: 'printQRCode',
        text: 'https://example.com/',
        moduleSize: 4,
        errorLevel: 'high',
      },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })

  it('空文字は hideWhenEmpty によらず飛ばす', () => {
    const commands = build([
      qrCodeElement({
        source: { kind: 'static', value: '' },
        hideWhenEmpty: false,
      }),
    ])

    expect(commands).toEqual([])
  })
})

describe('buildPrintCommands columns要素', () => {
  const columnsElement = (
    overrides: Partial<Extract<LayoutElement, { type: 'columns' }>> = {},
  ): LayoutElement => ({
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
    ...overrides,
  })

  it('列ごとの幅と寄せをまとめて渡す', () => {
    const commands = build(
      [columnsElement()],
      createPrintData({ 'field-1': { kind: 'text', value: '@mitsuharu_e' } }),
    )

    expect(commands).toEqual([
      {
        type: 'printColumns',
        texts: ['X:', '@mitsuharu_e'],
        widths: [10, 22],
        alignments: ['left', 'left'],
      },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })

  it('入力した値がすべて空なら、固定のラベルが残っていても飛ばす', () => {
    expect(build([columnsElement()], createPrintData({}))).toEqual([])
  })

  it('固定値だけの行は飛ばさない', () => {
    const commands = build([
      columnsElement({
        columns: [
          {
            source: { kind: 'static', value: '合計' },
            width: 10,
            alignment: 'left',
          },
          {
            source: { kind: 'static', value: '0円' },
            width: 22,
            alignment: 'right',
          },
        ],
      }),
    ])

    expect(commands).toContainEqual({
      type: 'printColumns',
      texts: ['合計', '0円'],
      widths: [10, 22],
      alignments: ['left', 'right'],
    })
  })

  it('列がなければ飛ばす', () => {
    expect(build([columnsElement({ columns: [] })])).toEqual([])
  })
})

describe('buildPrintCommands timestamp要素', () => {
  it('指定した時刻を書式に当てはめる', () => {
    const commands = build([
      {
        id: 'timestamp-1',
        type: 'timestamp',
        format: 'YYYY/MM/DD HH:mm',
        alignment: 'right',
      },
    ])

    expect(commands).toEqual([
      { type: 'setAlignment', alignment: 'right' },
      { type: 'printText', text: '2026/09/07 21:34' },
      { type: 'lineWrap', count: FEED_LINE_COUNT },
    ])
  })
})
