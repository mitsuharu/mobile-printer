import type {
  Layout,
  LayoutElement,
  LayoutElementType,
  TextSource,
} from '@/print'

const typeLabels: Record<LayoutElementType, string> = {
  text: 'テキスト',
  image: '画像',
  qrcode: 'QRコード',
  columns: '列',
  divider: '区切り線',
  spacer: '空白',
  timestamp: '印刷時刻',
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
  line: '実線',
  double: '二重線',
  dots: '点線',
  wave: '波線',
  plus: 'プラス',
  star: '星',
}

const describeTextSource = (source: TextSource, layout: Layout): string => {
  if (source.kind === 'static') {
    return source.value.trim() === '' ? '（未入力）' : source.value
  }
  const field = layout.fields.find(({ id }) => id === source.fieldId)
  return field ? `［${field.label || field.key}］` : '［参照先なし］'
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
      return element.source.asset ? `幅${element.width}px` : '（画像未選択）'
    case 'qrcode':
      return describeTextSource(element.source, layout)
    case 'columns':
      return element.columns
        .map((column) => describeTextSource(column.source, layout))
        .join(' / ')
    case 'divider':
      return barTypeLabels[element.barType] ?? element.barType
    case 'spacer':
      return `${element.lines}行`
    case 'timestamp':
      return element.format
  }
}
