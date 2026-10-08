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
  { value: 'left', title: 'Left' },
  { value: 'center', title: 'Center' },
  { value: 'right', title: 'Right' },
]

export const fontSizeItems: ListPickerItem<number>[] = [
  {
    value: FONT_SIZE.DEFAULT,
    title: 'Default',
    description: `${FONT_SIZE.DEFAULT}px`,
  },
  {
    value: FONT_SIZE.LARGE,
    title: 'Large',
    description: `${FONT_SIZE.LARGE}px`,
  },
]

export const imageTypeItems: ListPickerItem<PrintImageType>[] = [
  {
    value: 'binary',
    title: 'Black and white',
    description: 'Print using a black-and-white threshold',
  },
  { value: 'grayscale', title: 'Grayscale' },
]

export const barTypeItems: ListPickerItem<BarType>[] = [
  { value: 'line', title: 'Solid line' },
  { value: 'double', title: 'Double line' },
  { value: 'dots', title: 'Dotted line' },
  { value: 'wave', title: 'Wavy line' },
  { value: 'plus', title: 'Plus signs' },
  { value: 'star', title: 'Stars' },
]

export const errorLevelItems: ListPickerItem<QRErrorLevel>[] = [
  { value: 'low', title: 'Low', description: 'Allows more data' },
  { value: 'middle', title: 'Medium' },
  { value: 'quartile', title: 'Quartile' },
  { value: 'high', title: 'High', description: 'More resistant to damage' },
]

export const fieldValueTypeItems: ListPickerItem<FieldValueType>[] = [
  { value: 'text', title: 'Text' },
  { value: 'multilineText', title: 'Multiline text' },
  { value: 'url', title: 'URL' },
  { value: 'image', title: 'Image' },
]

export const timestampFormatItems: ListPickerItem<string>[] = [
  {
    value: 'YYYY/MM/DD HH:mm',
    title: 'Date and time',
    description: '2026/09/07 22:34',
  },
  { value: 'YYYY/MM/DD', title: 'Date', description: '2026/09/07' },
  { value: 'HH:mm', title: 'Time', description: '22:34' },
  {
    value: 'YYYY/MM/DD HH:mm:ss',
    title: 'Include seconds',
    description: '2026/09/07 22:34:00',
  },
]
