import { describe, expect, it, jest } from '@jest/globals'
import type { PrintCommand } from '../commands'
import { executePrintCommands, type Printer } from '../executePrintCommands'

type Recorded = [string, ...unknown[]]

const createPrinter = () => {
  const calls: Recorded[] = []
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push([name, ...args])
    }

  const printer: Printer = {
    setAlignment: record('setAlignment'),
    setFontSize: record('setFontSize'),
    setTextStyle: record('setTextStyle'),
    printText: record('printText'),
    printImage: record('printImage'),
    printQRCode: record('printQRCode'),
    printColumnsString: record('printColumnsString'),
    printHR: record('printHR'),
    lineWrap: record('lineWrap'),
    readImage: async (path: string) => {
      calls.push(['readImage', path])
      return 'AAAA'
    },
    buildHR: async (barType: string) => {
      calls.push(['buildHR', barType])
      return `<${barType}>`
    },
    enterBuffer: async () => {
      calls.push(['enterBuffer'])
    },
    exitBuffer: async () => {
      calls.push(['exitBuffer'])
    },
  } as unknown as Printer

  return { printer, calls }
}

describe('executePrintCommands', () => {
  it('操作がなければ何も呼ばない', async () => {
    const { printer, calls } = createPrinter()
    await executePrintCommands([], printer)
    expect(calls).toEqual([])
  })

  it('すべての操作を対応する呼び出しへ変換する', async () => {
    const { printer, calls } = createPrinter()
    const commands: PrintCommand[] = [
      { type: 'setAlignment', alignment: 'center' },
      { type: 'setFontSize', size: 32 },
      { type: 'setTextStyle', style: 'bold', enabled: true },
      { type: 'printText', text: '江本光晴' },
      {
        type: 'printImage',
        path: '/images/asset-1.png',
        width: 200,
        imageType: 'binary',
      },
      {
        type: 'printQRCode',
        text: 'https://example.com/',
        moduleSize: 8,
        errorLevel: 'low',
      },
      {
        type: 'printColumns',
        texts: ['X:', '@mitsuharu_e'],
        widths: [10, 22],
        alignments: ['left', 'left'],
      },
      { type: 'printHR', barType: 'wave' },
      { type: 'lineWrap', count: 3 },
    ]

    await executePrintCommands(commands, printer)

    expect(calls).toEqual([
      ['buildHR', 'wave'],
      ['enterBuffer'],
      ['setAlignment', 'center'],
      ['setFontSize', 32],
      ['setTextStyle', 'bold', true],
      ['printText', '江本光晴'],
      ['readImage', '/images/asset-1.png'],
      ['printImage', 'AAAA', 200, 'binary'],
      ['printQRCode', 'https://example.com/', 8, 'low'],
      [
        'printColumnsString',
        ['X:', '@mitsuharu_e'],
        [10, 22],
        ['left', 'left'],
      ],
      ['printHR', '<wave>'],
      ['lineWrap', 3],
      ['exitBuffer'],
    ])
  })

  it('操作の順序を保つ', async () => {
    const { printer, calls } = createPrinter()
    await executePrintCommands(
      [
        { type: 'printText', text: 'A' },
        { type: 'setFontSize', size: 32 },
        { type: 'printText', text: 'B' },
      ],
      printer,
    )

    expect(calls.map(([name]) => name)).toEqual([
      'enterBuffer',
      'printText',
      'setFontSize',
      'printText',
      'exitBuffer',
    ])
  })

  it('途中で失敗したらそこで止め、バッファから出る', async () => {
    const { printer, calls } = createPrinter()
    const failing: Printer = {
      ...printer,
      printText: jest.fn(() => {
        throw new Error('printer error')
      }),
    }

    await expect(
      executePrintCommands(
        [
          { type: 'setFontSize', size: 32 },
          { type: 'printText', text: 'A' },
          { type: 'lineWrap', count: 3 },
        ],
        failing,
      ),
    ).rejects.toThrow('printer error')

    // バッファから出ないままだと、次の印刷が溜まったまま出てこない
    expect(calls.map(([name]) => name)).toEqual([
      'enterBuffer',
      'setFontSize',
      'exitBuffer',
    ])
  })
})

describe('executePrintCommands の区切り線', () => {
  it('区切り線の文字列は、バッファへ入る前に作る', async () => {
    // 用紙幅の問い合わせはバッファ中に応答が返らず、印刷ごと止まってしまう
    const { printer, calls } = createPrinter()
    const commands: PrintCommand[] = [
      { type: 'printText', text: '所属の前' },
      { type: 'printHR', barType: 'line' },
      { type: 'printText', text: '株式会社 織田軍' },
      { type: 'printHR', barType: 'line' },
      { type: 'lineWrap', count: 3 },
    ]

    await executePrintCommands(commands, printer)

    expect(calls).toEqual([
      ['buildHR', 'line'],
      ['enterBuffer'],
      ['printText', '所属の前'],
      ['printHR', '<line>'],
      ['printText', '株式会社 織田軍'],
      ['printHR', '<line>'],
      ['lineWrap', 3],
      ['exitBuffer'],
    ])
  })

  it('同じ種類の区切り線は一度だけ作る', async () => {
    const { printer, calls } = createPrinter()
    await executePrintCommands(
      [
        { type: 'printHR', barType: 'line' },
        { type: 'printHR', barType: 'wave' },
        { type: 'printHR', barType: 'line' },
      ],
      printer,
    )

    expect(calls.filter(([name]) => name === 'buildHR')).toEqual([
      ['buildHR', 'line'],
      ['buildHR', 'wave'],
    ])
  })
})
