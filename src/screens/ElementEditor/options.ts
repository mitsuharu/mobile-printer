import type {
  Alignment,
  BarType,
  PrintImageType,
  QRErrorLevel,
} from '@mitsuharu/react-native-sunmi-printer-library'
import { FONT_SIZE } from '@/CONSTANTS'
import type { ListPickerItem } from '@/components/Modal/ListPickerModal'
import type { FieldValueType } from '@/print'

export const alignmentItems: ListPickerItem<Alignment>[] = [
  { value: 'left', title: '左寄せ' },
  { value: 'center', title: '中央' },
  { value: 'right', title: '右寄せ' },
]

export const fontSizeItems: ListPickerItem<number>[] = [
  {
    value: FONT_SIZE.DEFAULT,
    title: '標準',
    description: `${FONT_SIZE.DEFAULT}px`,
  },
  { value: FONT_SIZE.LARGE, title: '大', description: `${FONT_SIZE.LARGE}px` },
]

export const imageTypeItems: ListPickerItem<PrintImageType>[] = [
  { value: 'binary', title: '白黒', description: '二値化して印刷する' },
  { value: 'grayscale', title: 'グレースケール' },
]

export const barTypeItems: ListPickerItem<BarType>[] = [
  { value: 'line', title: '実線' },
  { value: 'double', title: '二重線' },
  { value: 'dots', title: '点線' },
  { value: 'wave', title: '波線' },
  { value: 'plus', title: 'プラス' },
  { value: 'star', title: '星' },
]

export const errorLevelItems: ListPickerItem<QRErrorLevel>[] = [
  { value: 'low', title: '低', description: '情報量を多くできる' },
  { value: 'middle', title: '中' },
  { value: 'quartile', title: 'やや高' },
  { value: 'high', title: '高', description: '汚れに強い' },
]

export const fieldValueTypeItems: ListPickerItem<FieldValueType>[] = [
  { value: 'text', title: 'テキスト' },
  { value: 'multilineText', title: '複数行テキスト' },
  { value: 'url', title: 'URL' },
  { value: 'image', title: '画像' },
]

export const timestampFormatItems: ListPickerItem<string>[] = [
  {
    value: 'YYYY/MM/DD HH:mm',
    title: '日付と時刻',
    description: '2026/09/07 22:34',
  },
  { value: 'YYYY/MM/DD', title: '日付', description: '2026/09/07' },
  { value: 'HH:mm', title: '時刻', description: '22:34' },
  {
    value: 'YYYY/MM/DD HH:mm:ss',
    title: '秒まで',
    description: '2026/09/07 22:34:00',
  },
]
