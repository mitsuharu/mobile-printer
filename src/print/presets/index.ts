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

/**
 * 名刺レイアウトと、その入力項目のIDを作る
 *
 * 従来のプロフィール印刷と同じ体裁を、要素の並びとして組み立てている。
 */
const createProfileLayout = (): {
  layout: Layout
  fieldIds: Record<FieldKey, string>
} => {
  const now = dayjs().valueOf()

  const fields: LayoutField[] = fieldDefinitions.map((definition) => ({
    id: createUUID(),
    ...definition,
  }))

  const fieldIds = Object.fromEntries(
    fields.map((field) => [field.key, field.id]),
  ) as Record<FieldKey, string>

  const elements: LayoutElement[] = [
    spacer(1),
    centeredText(fieldIds.name, FONT_SIZE.LARGE),
    centeredText(fieldIds.alias, FONT_SIZE.DEFAULT),
    spacer(1),
    {
      id: createUUID(),
      type: 'image',
      source: { kind: 'field', fieldId: fieldIds.icon },
      width: BASE64.PROFILE_ICON_SIZE,
      imageType: 'binary',
      alignment: 'center',
      hideWhenEmpty: true,
    },
    // 画像の下と本文の上でそれぞれ1行空けていた体裁に合わせる
    spacer(2),
    centeredText(fieldIds.description, FONT_SIZE.DEFAULT),

    // 区切り線は利用者がレイアウトで足すものとし、ここでは行を空けるだけにする
    spacer(1),
    centeredText(fieldIds.company, FONT_SIZE.DEFAULT),
    centeredText(fieldIds.position, FONT_SIZE.DEFAULT),
    centeredText(fieldIds.address, FONT_SIZE.DEFAULT),

    spacer(1),
    snsColumns('X:', fieldIds.twitter),
    snsColumns('Facebook:', fieldIds.facebook),
    snsColumns('GitHub:', fieldIds.github),
    snsColumns('Website:', fieldIds.website),

    spacer(1),
    centeredText(fieldIds.qrDescription, FONT_SIZE.DEFAULT),
    spacer(1),
    {
      id: createUUID(),
      type: 'qrcode',
      source: { kind: 'field', fieldId: fieldIds.qrUrl },
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
      name: '名刺',
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
  fieldIds: Record<FieldKey, string>,
  title: string,
  values: Partial<Record<FieldKey, PrintDataValue>>,
): PrintData => {
  const now = dayjs().valueOf()
  return {
    id: createUUID(),
    layoutId: layout.id,
    title,
    values: Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        fieldIds[key as FieldKey],
        value,
      ]),
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
  const { layout, fieldIds } = createProfileLayout()
  const images: PresetImage[] = []

  const printData: PrintData[] = [
    createPrintDataFor(layout, fieldIds, '開発者紹介', {
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
    createPrintDataFor(layout, fieldIds, 'サンプル', {
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

  return { layouts: [layout], printData, images }
}
