import { describe, expect, it } from '@jest/globals'
import { buildPrintCommands } from '../buildPrintCommands'
import { createPresets } from '../presets'

const { layouts, printData } = createPresets()
const [layout] = layouts

const commandsFor = (title: string) => {
  const value = printData.find((data) => data.title === title)
  if (!value) {
    throw new Error(`print data not found: ${title}`)
  }
  return buildPrintCommands(layout, value, { printedAt: 0 })
}

const textsOf = (title: string) =>
  commandsFor(title).flatMap((command) =>
    command.type === 'printText' ? [command.text] : [],
  )

describe('createPresets', () => {
  it('名刺レイアウトを1つ用意する', () => {
    expect(layouts).toHaveLength(1)
    expect(layout.name).toBe('名刺')
  })

  it('印刷データを3つ用意する', () => {
    expect(printData.map(({ title }) => title)).toEqual([
      '宣伝',
      '開発者紹介',
      'サンプル',
    ])
  })

  it('印刷データはすべて名刺レイアウトに紐づく', () => {
    expect(printData.every((value) => value.layoutId === layout.id)).toBe(true)
  })

  it('差し込み口のキーは重複しない', () => {
    const keys = layout.fields.map(({ key }) => key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('要素が参照する差し込み口はすべて存在する', () => {
    const ids = new Set(layout.fields.map(({ id }) => id))
    const referenced = layout.elements.flatMap((element) => {
      if (element.type === 'columns') {
        return element.columns.flatMap(({ source }) =>
          source.kind === 'field' ? [source.fieldId] : [],
        )
      }
      if (
        element.type === 'text' ||
        element.type === 'qrcode' ||
        element.type === 'image'
      ) {
        return element.source.kind === 'field' ? [element.source.fieldId] : []
      }
      return []
    })

    expect(referenced.length).toBeGreaterThan(0)
    expect(referenced.every((id) => ids.has(id))).toBe(true)
  })

  it('印刷データが入れる値のキーもすべて存在する', () => {
    const ids = new Set(layout.fields.map(({ id }) => id))
    for (const value of printData) {
      for (const fieldId of Object.keys(value.values)) {
        expect(ids.has(fieldId)).toBe(true)
      }
    }
  })
})

describe('createPresets の印刷内容', () => {
  it('従来のプロフィール印刷と同じ並びで宣伝を出力する', () => {
    expect(textsOf('宣伝')).toEqual([
      '江本光晴',
      'Mitsuharu Emoto',
      'この印刷アプリの話でも、iOSエンジニアのキャリアや採用の話でも、カジュアル面談はお気軽にどうぞ',
      '株式会社ゆめみ',
      'iOS テックリード',
      'カジュアル面談はこちらから',
      '1970/01/01 09:00',
    ])
  })

  it('値のない項目は印刷しない', () => {
    // 開発者紹介は会社名・職種・アドレスを持たない
    const texts = textsOf('開発者紹介')
    expect(texts).not.toContain('株式会社ゆめみ')
    expect(texts).toContain('iOSアプリの開発が好き')
  })

  it('値のあるSNSの行だけを出力する', () => {
    const columns = commandsFor('宣伝').flatMap((command) =>
      command.type === 'printColumns' ? [command.texts] : [],
    )

    expect(columns).toEqual([
      ['X:', '@mitsuharu_e'],
      ['Facebook:', 'mitsuharu.emoto'],
      ['GitHub:', 'mitsuharu'],
    ])
  })

  it('アイコン画像とQRコードを出力する', () => {
    const commands = commandsFor('サンプル')

    expect(commands.some((command) => command.type === 'printImage')).toBe(true)
    expect(commands.find((command) => command.type === 'printQRCode')).toEqual({
      type: 'printQRCode',
      text: 'https://ja.wikipedia.org/wiki/%E7%B9%94%E7%94%B0%E4%BF%A1%E9%95%B7',
      moduleSize: 8,
      errorLevel: 'low',
    })
  })

  it('画像は印刷用の幅で出力する', () => {
    const image = commandsFor('サンプル').find(
      (command) => command.type === 'printImage',
    )
    expect(image).toMatchObject({ width: 200, imageType: 'binary' })
  })
})
