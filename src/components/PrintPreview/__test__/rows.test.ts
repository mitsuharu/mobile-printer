import { describe, expect, it } from '@jest/globals'
import type { PrintCommand } from '@/print'
import { buildPreviewRows } from '../rows'

describe('buildPreviewRows', () => {
  it('操作がなければ行も作らない', () => {
    expect(buildPreviewRows([])).toEqual([])
  })

  it('直前に指定された書式でテキストを描く', () => {
    const commands: PrintCommand[] = [
      { type: 'setAlignment', alignment: 'right' },
      { type: 'setFontSize', size: 32 },
      { type: 'setTextStyle', style: 'bold', enabled: true },
      { type: 'setTextStyle', style: 'underline', enabled: true },
      { type: 'printText', text: '江本光晴' },
    ]

    expect(buildPreviewRows(commands)).toEqual([
      {
        type: 'text',
        text: '江本光晴',
        fontSize: 32,
        bold: true,
        underline: true,
        alignment: 'right',
      },
    ])
  })

  it('書式の指定は次のテキストへ引き継ぐ', () => {
    const commands: PrintCommand[] = [
      { type: 'setFontSize', size: 32 },
      { type: 'printText', text: 'A' },
      { type: 'printText', text: 'B' },
    ]

    const rows = buildPreviewRows(commands)
    expect(rows.map((row) => row.type === 'text' && row.fontSize)).toEqual([
      32, 32,
    ])
  })

  it('書式の解除も反映する', () => {
    const commands: PrintCommand[] = [
      { type: 'setTextStyle', style: 'bold', enabled: true },
      { type: 'printText', text: 'A' },
      { type: 'setTextStyle', style: 'bold', enabled: false },
      { type: 'printText', text: 'B' },
    ]

    const rows = buildPreviewRows(commands)
    expect(rows.map((row) => row.type === 'text' && row.bold)).toEqual([
      true,
      false,
    ])
  })

  it('書式を指定していなければ既定の書式で描く', () => {
    expect(buildPreviewRows([{ type: 'printText', text: 'A' }])).toEqual([
      {
        type: 'text',
        text: 'A',
        fontSize: 24,
        bold: false,
        underline: false,
        alignment: 'left',
      },
    ])
  })

  it('画像・QR・列・区切り線・空白を行にする', () => {
    const commands: PrintCommand[] = [
      { type: 'setAlignment', alignment: 'center' },
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

    expect(buildPreviewRows(commands)).toEqual([
      {
        type: 'image',
        path: '/images/asset-1.png',
        width: 200,
        imageType: 'binary',
        alignment: 'center',
      },
      {
        type: 'qrcode',
        text: 'https://example.com/',
        moduleSize: 8,
        alignment: 'center',
      },
      {
        type: 'columns',
        texts: ['X:', '@mitsuharu_e'],
        widths: [10, 22],
        alignments: ['left', 'left'],
        fontSize: 24,
      },
      { type: 'divider', barType: 'wave' },
      { type: 'blank', count: 3 },
    ])
  })
})
