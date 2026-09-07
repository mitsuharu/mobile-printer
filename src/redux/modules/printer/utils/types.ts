import type { PrintImageType } from '@mitsuharu/react-native-sunmi-printer-library'

/**
 * テキスト印刷のデータ
 */
export type TextSource = {
  text: string
  size: 'default' | 'large'
}

/**
 * 画像印刷のデータ
 */
export type ImageSource = {
  base64: string
  type: PrintImageType
  width: number
}

/**
 * QRコード印刷のデータ
 */
export type QRCodeSource = {
  text: string
}
