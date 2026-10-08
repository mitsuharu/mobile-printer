import type {
  Layout,
  LayoutElement,
  LayoutElementType,
  TextSource,
} from '@/print'

const typeLabels: Record<LayoutElementType, string> = {
  text: 'Text',
  image: 'Image',
  qrcode: 'QR code',
  columns: 'Columns',
  divider: 'Divider',
  spacer: 'Blank space',
  timestamp: 'Print timestamp',
}

/**
 * 要素の種類の表示名
 */
export const describeElementType = (type: LayoutElementType): string =>
  typeLabels[type]

/**
 * 追加できる要素の種類（一覧の表示順）
 */
export const addableElementTypes: LayoutElementType[] = [
  'text',
  'image',
  'qrcode',
  'columns',
  'divider',
  'spacer',
  'timestamp',
]

const barTypeLabels: Record<string, string> = {
  line: 'Solid line',
  double: 'Double line',
  dots: 'Dotted line',
  wave: 'Wavy line',
  plus: 'Plus signs',
  star: 'Stars',
}

const describeTextSource = (source: TextSource, layout: Layout): string => {
  if (source.kind === 'static') {
    return source.value.trim() === '' ? '(empty)' : source.value
  }
  const field = layout.fields.find(({ id }) => id === source.fieldId)
  return field ? `［${field.label || field.key}］` : '[missing field]'
}

/**
 * 一覧で要素の中身を1行で伝える
 */
export const describeElement = (
  element: LayoutElement,
  layout: Layout,
): string => {
  switch (element.type) {
    case 'text':
      return describeTextSource(element.source, layout)
    case 'image':
      if (element.source.kind === 'field') {
        return describeTextSource(element.source, layout)
      }
      return element.source.asset
        ? `Width: ${element.width}px`
        : '(no image selected)'
    case 'qrcode':
      return describeTextSource(element.source, layout)
    case 'columns':
      return element.columns
        .map((column) => describeTextSource(column.source, layout))
        .join(' / ')
    case 'divider':
      return barTypeLabels[element.barType] ?? element.barType
    case 'spacer':
      return `${element.lines} lines`
    case 'timestamp':
      return element.format
  }
}
