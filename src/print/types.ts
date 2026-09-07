import type {
  Alignment,
  BarType,
  PrintImageType,
  QRErrorLevel,
} from '@mitsuharu/react-native-sunmi-printer-library'

/**
 * 印刷する画像
 *
 * `width` と `imageType` は取り込んだときの設定で、印刷時は要素側の指定が優先される。
 */
export type ImageAsset = {
  id: string
  base64: string
  width: number
  imageType: PrintImageType
}

/**
 * 印刷データへ入力できる値の種類
 */
export type FieldValueType = 'text' | 'multilineText' | 'url' | 'image'

/**
 * レイアウトが宣言する差し込み口
 */
export type LayoutField = {
  id: string
  /**
   * 印刷データ側で参照する識別子。レイアウト内で一意
   */
  key: string
  label: string
  valueType: FieldValueType
}

/**
 * 文字を持つ要素の供給元
 */
export type TextSource =
  | { kind: 'static'; value: string }
  | { kind: 'field'; fieldId: string }

/**
 * 画像要素の供給元
 *
 * 固定の画像は、要素を追加した直後など、まだ画像を選んでいない状態を取り得る。
 */
export type ImageSource =
  | { kind: 'static'; asset?: ImageAsset }
  | { kind: 'field'; fieldId: string }

type ElementBase = {
  id: string
}

/**
 * 供給元を持つ要素は、値が空なら印刷を飛ばせる
 */
type OmittableElement = ElementBase & {
  hideWhenEmpty: boolean
}

export type TextElement = OmittableElement & {
  type: 'text'
  source: TextSource
  fontSize: number
  bold: boolean
  underline: boolean
  alignment: Alignment
}

export type ImageElement = OmittableElement & {
  type: 'image'
  source: ImageSource
  width: number
  imageType: PrintImageType
  alignment: Alignment
}

export type QRCodeElement = OmittableElement & {
  type: 'qrcode'
  source: TextSource
  /**
   * QRコードの1マスの大きさ（1〜16）
   */
  moduleSize: number
  errorLevel: QRErrorLevel
  alignment: Alignment
}

export type LayoutColumn = {
  source: TextSource
  /**
   * 半角文字に換算した列幅
   */
  width: number
  alignment: Alignment
}

export type ColumnsElement = OmittableElement & {
  type: 'columns'
  columns: LayoutColumn[]
}

export type DividerElement = ElementBase & {
  type: 'divider'
  barType: BarType
}

export type SpacerElement = ElementBase & {
  type: 'spacer'
  lines: number
}

export type TimestampElement = ElementBase & {
  type: 'timestamp'
  /**
   * dayjs の書式
   */
  format: string
  alignment: Alignment
}

export type LayoutElement =
  | TextElement
  | ImageElement
  | QRCodeElement
  | ColumnsElement
  | DividerElement
  | SpacerElement
  | TimestampElement

export type LayoutElementType = LayoutElement['type']

/**
 * 印刷の体裁
 */
export type Layout = {
  id: string
  name: string
  fields: LayoutField[]
  elements: LayoutElement[]
  createdAt: number
  updatedAt: number
}

/**
 * 印刷データがフィールドへ入れる値
 */
export type PrintDataValue =
  | { kind: 'text'; value: string }
  | { kind: 'image'; asset: ImageAsset }

/**
 * レイアウトへ差し込む値のひとまとまり
 */
export type PrintData = {
  id: string
  layoutId: string
  title: string
  /**
   * `LayoutField.id` をキーにした値
   */
  values: Record<string, PrintDataValue | undefined>
  createdAt: number
  updatedAt: number
}
