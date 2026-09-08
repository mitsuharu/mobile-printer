import type { PrintImageType } from '@mitsuharu/react-native-sunmi-printer-library'
import dayjs from 'dayjs'
import { BASE64, FONT_SIZE } from '@/CONSTANTS'
import { createUUID } from '@/utils/uuid'
import { DEFAULT_TIMESTAMP_FORMAT } from '../factory'
import type {
  ImageAsset,
  Layout,
  LayoutElement,
  LayoutField,
  PrintData,
  PrintDataValue,
} from '../types'
import { AVATAR_BASE64 } from './avatar'
import { SAMPLE_AVATAR_BASE64 } from './sampleAvatar'

/**
 * プリセットの名刺レイアウトが持つ入力項目
 */
const FIELD_KEYS = [
  'name',
  'alias',
  'icon',
  'description',
  'company',
  'position',
  'address',
  'twitter',
  'facebook',
  'github',
  'website',
  'qrUrl',
  'qrDescription',
] as const

type FieldKey = (typeof FIELD_KEYS)[number]

const fieldDefinitions: {
  key: FieldKey
  label: string
  valueType: LayoutField['valueType']
}[] = [
  { key: 'name', label: '名前', valueType: 'text' },
  { key: 'alias', label: '別名、読み仮名など', valueType: 'text' },
  { key: 'icon', label: 'アイコン画像', valueType: 'image' },
  { key: 'description', label: 'フリーテキスト', valueType: 'multilineText' },
  { key: 'company', label: '会社名', valueType: 'text' },
  { key: 'position', label: '職種など', valueType: 'text' },
  { key: 'address', label: 'アドレス', valueType: 'text' },
  { key: 'twitter', label: 'X(Twitter)', valueType: 'text' },
  { key: 'facebook', label: 'Facebook', valueType: 'text' },
  { key: 'github', label: 'GitHub', valueType: 'text' },
  { key: 'website', label: 'Website', valueType: 'text' },
  { key: 'qrUrl', label: 'QRコードのURL', valueType: 'url' },
  { key: 'qrDescription', label: 'QRコードの説明', valueType: 'text' },
]

const centeredText = (fieldId: string, fontSize: number): LayoutElement => ({
  id: createUUID(),
  type: 'text',
  source: { kind: 'field', fieldId },
  fontSize,
  bold: true,
  underline: false,
  alignment: 'center',
  hideWhenEmpty: true,
})

const snsColumns = (label: string, fieldId: string): LayoutElement => ({
  id: createUUID(),
  type: 'columns',
  columns: [
    { source: { kind: 'static', value: label }, width: 10, alignment: 'left' },
    { source: { kind: 'field', fieldId }, width: 22, alignment: 'left' },
  ],
  hideWhenEmpty: true,
})

const spacer = (lines: number): LayoutElement => ({
  id: createUUID(),
  type: 'spacer',
  lines,
})

const divider = (): LayoutElement => ({
  id: createUUID(),
  type: 'divider',
  barType: 'line',
})

/**
 * 所属のまとまりを作る入力項目
 *
 * 勤め先のない名刺では、この3つと、それを挟む罫線ごと外す。
 */
const ORGANIZATION_KEYS: FieldKey[] = ['company', 'position', 'address']

type LayoutFieldIds = Partial<Record<FieldKey, string>>

type ProfileLayoutOptions = {
  name: string

  /**
   * 所属のまとまりと罫線を入れるか
   */
  withOrganization: boolean

  /**
   * アイコン画像の印刷のしかた
   */
  imageType: PrintImageType
}

/**
 * 名刺レイアウトと、その入力項目のIDを作る
 *
 * 従来のプロフィール印刷と同じ体裁を、要素の並びとして組み立てている。
 */
const createProfileLayout = ({
  name,
  withOrganization,
  imageType,
}: ProfileLayoutOptions): {
  layout: Layout
  fieldIds: LayoutFieldIds
} => {
  const now = dayjs().valueOf()

  const definitions = withOrganization
    ? fieldDefinitions
    : fieldDefinitions.filter(({ key }) => !ORGANIZATION_KEYS.includes(key))

  const fields: LayoutField[] = definitions.map((definition) => ({
    id: createUUID(),
    ...definition,
  }))

  const fieldIds: LayoutFieldIds = Object.fromEntries(
    fields.map((field) => [field.key, field.id]),
  )

  const requireFieldId = (key: FieldKey): string => {
    const id = fieldIds[key]
    if (!id) {
      throw new Error(`preset field not found: ${key}`)
    }
    return id
  }

  // 所属のまとまり。上を罫線で区切る
  const organization: LayoutElement[] = withOrganization
    ? [
        spacer(1),
        divider(),
        centeredText(requireFieldId('company'), FONT_SIZE.DEFAULT),
        centeredText(requireFieldId('position'), FONT_SIZE.DEFAULT),
        centeredText(requireFieldId('address'), FONT_SIZE.DEFAULT),
      ]
    : [spacer(1)]

  const elements: LayoutElement[] = [
    spacer(1),
    centeredText(requireFieldId('name'), FONT_SIZE.LARGE),
    centeredText(requireFieldId('alias'), FONT_SIZE.DEFAULT),
    spacer(1),
    {
      id: createUUID(),
      type: 'image',
      source: { kind: 'field', fieldId: requireFieldId('icon') },
      width: BASE64.PROFILE_ICON_SIZE,
      imageType,
      alignment: 'center',
      hideWhenEmpty: true,
    },
    // 画像の下と本文の上でそれぞれ1行空けていた体裁に合わせる
    spacer(2),
    centeredText(requireFieldId('description'), FONT_SIZE.DEFAULT),

    ...organization,

    // SNSの上下は罫線で区切る
    divider(),
    snsColumns('X:', requireFieldId('twitter')),
    snsColumns('Facebook:', requireFieldId('facebook')),
    snsColumns('GitHub:', requireFieldId('github')),
    snsColumns('Website:', requireFieldId('website')),
    divider(),

    centeredText(requireFieldId('qrDescription'), FONT_SIZE.DEFAULT),
    spacer(1),
    {
      id: createUUID(),
      type: 'qrcode',
      source: { kind: 'field', fieldId: requireFieldId('qrUrl') },
      moduleSize: 8,
      errorLevel: 'low',
      alignment: 'center',
      hideWhenEmpty: true,
    },
    // QRコードの下と印刷時刻の上でそれぞれ1行空けていた体裁に合わせる
    spacer(2),
    {
      id: createUUID(),
      type: 'timestamp',
      format: DEFAULT_TIMESTAMP_FORMAT,
      alignment: 'right',
    },
  ]

  return {
    layout: {
      id: createUUID(),
      name,
      fields,
      elements,
      createdAt: now,
      updatedAt: now,
    },
    fieldIds,
  }
}

const text = (value: string): PrintDataValue => ({ kind: 'text', value })

/**
 * プリセットが同梱している画像
 *
 * ここでは Base64 のまま持ち、保存するときにファイルへ書き出してパスを埋める。
 */
export type PresetImage = { id: string; base64: string }

const createImage = (base64: string, images: PresetImage[]): PrintDataValue => {
  const id = createUUID()
  images.push({ id, base64 })
  return {
    kind: 'image',
    asset: {
      id,
      // 保存時にファイルへ書き出してから埋める
      path: '',
      width: BASE64.PROFILE_ICON_SIZE,
      imageType: 'binary',
    } satisfies ImageAsset,
  }
}

const createPrintDataFor = (
  layout: Layout,
  fieldIds: LayoutFieldIds,
  title: string,
  values: Partial<Record<FieldKey, PrintDataValue>>,
): PrintData => {
  const now = dayjs().valueOf()
  return {
    id: createUUID(),
    layoutId: layout.id,
    title,
    values: Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        const fieldId = fieldIds[key as FieldKey]
        if (!fieldId) {
          // レイアウトが持たない項目へ値を入れようとしている
          throw new Error(`preset field not found: ${key}`)
        }
        return [fieldId, value]
      }),
    ),
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * 初回起動時に用意するレイアウトと印刷データ
 */
export const createPresets = (): {
  layouts: Layout[]
  printData: PrintData[]
  images: PresetImage[]
} => {
  const card = createProfileLayout({
    name: '名刺',
    withOrganization: true,
    // 写真や絵をそのまま載せることを想定して、濃淡を残す
    imageType: 'grayscale',
  })
  const simpleCard = createProfileLayout({
    name: '名刺（シンプル）',
    withOrganization: false,
    imageType: 'binary',
  })
  const images: PresetImage[] = []

  const printData: PrintData[] = [
    createPrintDataFor(simpleCard.layout, simpleCard.fieldIds, '開発者紹介', {
      name: text('江本光晴'),
      alias: text('Mitsuharu Emoto'),
      icon: createImage(AVATAR_BASE64, images),
      description: text('iOSアプリの開発が好き'),
      twitter: text('@mitsuharu_e'),
      facebook: text('mitsuharu.emoto'),
      github: text('mitsuharu'),
      website: text('https://mitsuharu.github.io/'),
      qrUrl: text('https://twitter.com/mitsuharu_e'),
      qrDescription: text('follow me'),
    }),
    createPrintDataFor(card.layout, card.fieldIds, 'サンプル', {
      name: text('織田信長'),
      alias: text('Nobunaga Oda'),
      icon: createImage(SAMPLE_AVATAR_BASE64, images),
      description: text('人間五十年、下天の内をくらぶれば、夢幻の如くなり'),
      company: text('株式会社 織田軍'),
      position: text('代表取締役大名'),
      address: text('尾張国'),
      twitter: text('tw'),
      facebook: text('fb'),
      github: text('gh'),
      website: text('https://example.com/'),
      qrUrl: text(
        'https://ja.wikipedia.org/wiki/%E7%B9%94%E7%94%B0%E4%BF%A1%E9%95%B7',
      ),
      qrDescription: text('go to Wikipedia'),
    }),
  ]

  return { layouts: [card.layout, simpleCard.layout], printData, images }
}
