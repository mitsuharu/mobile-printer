import { describe, expect, it } from '@jest/globals'
import { buildPrintCommands } from '../buildPrintCommands'
import { createPresets } from '../presets'

const { layouts, printData, images } = createPresets()

const layoutNamed = (name: string) => {
  const value = layouts.find((layout) => layout.name === name)
  if (!value) {
    throw new Error(`layout not found: ${name}`)
  }
  return value
}

const printDataTitled = (title: string) => {
  const value = printData.find((data) => data.title === title)
  if (!value) {
    throw new Error(`print data not found: ${title}`)
  }
  return value
}

/**
 * 印刷データが紐づくレイアウト
 */
const layoutOf = (title: string) => {
  const { layoutId } = printDataTitled(title)
  const value = layouts.find(({ id }) => id === layoutId)
  if (!value) {
    throw new Error(`layout not found for: ${title}`)
  }
  return value
}

/**
 * 保存時に画像ファイルへ書き出してパスが埋まった状態にする
 */
const withImagePaths = (title: string) => {
  const value = printDataTitled(title)
  return {
    ...value,
    values: Object.fromEntries(
      Object.entries(value.values).map(([fieldId, printDataValue]) => [
        fieldId,
        printDataValue?.kind === 'image'
          ? {
              ...printDataValue,
              asset: {
                ...printDataValue.asset,
                path: `/images/${printDataValue.asset.id}.png`,
              },
            }
          : printDataValue,
      ]),
    ),
  }
}

const commandsFor = (title: string) =>
  buildPrintCommands(layoutOf(title), printDataTitled(title), { printedAt: 0 })

/**
 * 要素が参照している入力項目のID
 */
const referencedFieldIds = (layout: (typeof layouts)[number]) =>
  layout.elements.flatMap((element) => {
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

const textsOf = (title: string) =>
  commandsFor(title).flatMap((command) =>
    command.type === 'printText' ? [command.text] : [],
  )

describe('createPresets', () => {
  it('名刺レイアウトを2つ用意する', () => {
    expect(layouts.map(({ name }) => name)).toEqual([
      '名刺',
      '名刺（シンプル）',
    ])
  })

  it('印刷データを2つ用意する', () => {
    expect(printData.map(({ title }) => title)).toEqual([
      '開発者紹介',
      'サンプル',
    ])
  })

  it('同梱の画像を Base64 で持ち出す', () => {
    expect(images).toHaveLength(2)
    expect(images.every(({ base64 }) => base64.length > 0)).toBe(true)
  })

  it('同梱の画像のIDは印刷データの値と一致する', () => {
    const assetIds = printData.flatMap((value) =>
      Object.values(value.values).flatMap((printDataValue) =>
        printDataValue?.kind === 'image' ? [printDataValue.asset.id] : [],
      ),
    )
    expect(assetIds.sort()).toEqual(images.map(({ id }) => id).sort())
  })

  it('印刷データは別々のレイアウトに紐づく', () => {
    expect(layoutOf('サンプル').name).toBe('名刺')
    expect(layoutOf('開発者紹介').name).toBe('名刺（シンプル）')
  })

  it('入力項目のキーは重複しない', () => {
    for (const layout of layouts) {
      const keys = layout.fields.map(({ key }) => key)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('要素が参照する入力項目はすべて存在する', () => {
    for (const layout of layouts) {
      const ids = new Set(layout.fields.map(({ id }) => id))
      const referenced = referencedFieldIds(layout)

      expect(referenced.length).toBeGreaterThan(0)
      expect(referenced.every((id) => ids.has(id))).toBe(true)
    }
  })

  it('印刷データが入れる値のキーもすべて存在する', () => {
    for (const value of printData) {
      const ids = new Set(layoutOf(value.title).fields.map(({ id }) => id))
      for (const fieldId of Object.keys(value.values)) {
        expect(ids.has(fieldId)).toBe(true)
      }
    }
  })

  it('シンプルな名刺は所属の入力項目を持たない', () => {
    // 入力欄に使わない項目が並ぶと、何を入れればよいのか分からなくなる
    const keys = layoutNamed('名刺（シンプル）').fields.map(({ key }) => key)
    expect(keys).not.toContain('company')
    expect(keys).not.toContain('position')
    expect(keys).not.toContain('address')
  })

  it('シンプルな名刺はSNSの上下だけ罫線を引く', () => {
    // 所属がないので、所属の上に引いていた1本だけがなくなる
    const elements = layoutNamed('名刺（シンプル）').elements
    expect(elements.filter(({ type }) => type === 'divider')).toHaveLength(2)
  })

  it('通常の名刺は所属も罫線も持つ', () => {
    const layout = layoutNamed('名刺')
    const keys = layout.fields.map(({ key }) => key)
    expect(keys).toContain('company')
    expect(
      layout.elements.filter(({ type }) => type === 'divider'),
    ).toHaveLength(3)
  })
})

describe('createPresets の印刷内容', () => {
  it('従来のプロフィール印刷と同じ並びでサンプルを出力する', () => {
    expect(textsOf('サンプル')).toEqual([
      '織田信長',
      'Nobunaga Oda',
      '人間五十年、下天の内をくらぶれば、夢幻の如くなり',
      '株式会社 織田軍',
      '代表取締役大名',
      '尾張国',
      'go to Wikipedia',
      '1970/01/01 09:00',
    ])
  })

  it('値のない項目は印刷しない', () => {
    // 開発者紹介は会社名・職種・アドレスを持たない
    const texts = textsOf('開発者紹介')
    expect(texts).not.toContain('株式会社 織田軍')
    expect(texts).toContain('iOSアプリの開発が好き')
  })

  it('値のあるSNSの行だけを出力する', () => {
    const columns = commandsFor('開発者紹介').flatMap((command) =>
      command.type === 'printColumns' ? [command.texts] : [],
    )

    expect(columns).toEqual([
      ['X:', '@mitsuharu_e'],
      ['Facebook:', 'mitsuharu.emoto'],
      ['GitHub:', 'mitsuharu'],
      ['Website:', 'https://mitsuharu.github.io/'],
    ])
  })

  it('従来と同じ位置で行を空ける', () => {
    const commands = commandsFor('サンプル')
    const blanks = commands.flatMap((command, index) =>
      command.type === 'lineWrap' ? [{ index, count: command.count }] : [],
    )

    // 冒頭・画像の前後・所属の前・QRコードの前後・末尾の紙送り
    // 罫線の前後には空けない。罫線そのものが区切りになる。
    expect(blanks.map(({ count }) => count)).toEqual([1, 1, 2, 1, 1, 2, 3])
  })

  it('所属の上とSNSの上下に罫線を入れる', () => {
    const commands = commandsFor('サンプル')
    const marks = commands.flatMap((command) => {
      if (command.type === 'printHR') {
        return ['---']
      }
      if (command.type === 'printText') {
        return [command.text]
      }
      if (command.type === 'printColumns') {
        return [command.texts.join(' ')]
      }
      return []
    })

    expect(marks).toEqual([
      '織田信長',
      'Nobunaga Oda',
      '人間五十年、下天の内をくらぶれば、夢幻の如くなり',
      '---',
      '株式会社 織田軍',
      '代表取締役大名',
      '尾張国',
      '---',
      'X: tw',
      'Facebook: fb',
      'GitHub: gh',
      'Website: https://example.com/',
      '---',
      'go to Wikipedia',
      '1970/01/01 09:00',
    ])
  })

  it('開発者紹介は所属なしで、SNSの上下に罫線を出力する', () => {
    const marks = commandsFor('開発者紹介').flatMap((command) => {
      if (command.type === 'printHR') {
        return ['---']
      }
      if (command.type === 'printText') {
        return [command.text]
      }
      if (command.type === 'printColumns') {
        return [command.texts.join(' ')]
      }
      return []
    })

    expect(marks).toEqual([
      '江本光晴',
      'Mitsuharu Emoto',
      'iOSアプリの開発が好き',
      '---',
      'X: @mitsuharu_e',
      'Facebook: mitsuharu.emoto',
      'GitHub: mitsuharu',
      'Website: https://mitsuharu.github.io/',
      '---',
      'follow me',
      '1970/01/01 09:00',
    ])
  })

  it('罫線は3本だけにする', () => {
    expect(
      commandsFor('サンプル').filter((command) => command.type === 'printHR'),
    ).toHaveLength(3)
  })

  it('アイコン画像とQRコードを出力する', () => {
    const commands = buildPrintCommands(
      layoutOf('サンプル'),
      withImagePaths('サンプル'),
      { printedAt: 0 },
    )

    expect(commands.some((command) => command.type === 'printImage')).toBe(true)
    expect(commands.find((command) => command.type === 'printQRCode')).toEqual({
      type: 'printQRCode',
      text: 'https://ja.wikipedia.org/wiki/%E7%B9%94%E7%94%B0%E4%BF%A1%E9%95%B7',
      moduleSize: 8,
      errorLevel: 'low',
    })
  })

  it('名刺の画像はグレースケールで出力する', () => {
    // 写真や絵をそのまま載せることを想定して、濃淡を残す
    const image = buildPrintCommands(
      layoutOf('サンプル'),
      withImagePaths('サンプル'),
      { printedAt: 0 },
    ).find((command) => command.type === 'printImage')
    expect(image).toMatchObject({ width: 200, imageType: 'grayscale' })
  })

  it('シンプルな名刺の画像は白黒で出力する', () => {
    const image = buildPrintCommands(
      layoutOf('開発者紹介'),
      withImagePaths('開発者紹介'),
      { printedAt: 0 },
    ).find((command) => command.type === 'printImage')
    expect(image).toMatchObject({ width: 200, imageType: 'binary' })
  })

  it('画像はファイルへ書き出す前だと印刷されない', () => {
    // createPresets の時点ではパスが空で、保存時に埋まる
    expect(
      commandsFor('サンプル').some((command) => command.type === 'printImage'),
    ).toBe(false)
  })
})
