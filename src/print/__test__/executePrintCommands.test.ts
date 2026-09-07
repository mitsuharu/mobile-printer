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
      ['printHR', 'wave'],
      ['lineWrap', 3],
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
      'printText',
      'setFontSize',
      'printText',
    ])
  })

  it('途中で失敗したらそこで止める', async () => {
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

    expect(calls.map(([name]) => name)).toEqual(['setFontSize'])
  })
})
