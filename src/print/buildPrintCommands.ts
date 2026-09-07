import dayjs from 'dayjs'
import type { PrintCommand } from './commands'
import type {
  ColumnsElement,
  ImageAsset,
  ImageElement,
  ImageSource,
  Layout,
  LayoutElement,
  PrintData,
  QRCodeElement,
  TextElement,
  TextSource,
  TimestampElement,
} from './types'

/**
 * 印刷後に紙を送る行数
 */
export const FEED_LINE_COUNT = 3

export type BuildPrintCommandsOptions = {
  /**
   * `timestamp` 要素が使う時刻。省略すると現在時刻
   */
  printedAt?: number
}

const resolveText = (
  source: TextSource,
  printData: PrintData | undefined,
): string => {
  if (source.kind === 'static') {
    return source.value
  }
  const value = printData?.values[source.fieldId]
  return value?.kind === 'text' ? value.value : ''
}

const resolveImage = (
  source: ImageSource,
  printData: PrintData | undefined,
): ImageAsset | undefined => {
  if (source.kind === 'static') {
    return source.asset
  }
  const value = printData?.values[source.fieldId]
  return value?.kind === 'image' ? value.asset : undefined
}

const isBlank = (text: string) => text.trim().length === 0

const textCommands = (
  element: TextElement,
  printData: PrintData | undefined,
): PrintCommand[] => {
  const text = resolveText(element.source, printData)
  if (element.hideWhenEmpty && isBlank(text)) {
    return []
  }
  return [
    { type: 'setAlignment', alignment: element.alignment },
    { type: 'setFontSize', size: element.fontSize },
    { type: 'setTextStyle', style: 'bold', enabled: element.bold },
    { type: 'setTextStyle', style: 'underline', enabled: element.underline },
    { type: 'printText', text },
  ]
}

const imageCommands = (
  element: ImageElement,
  printData: PrintData | undefined,
): PrintCommand[] => {
  const asset = resolveImage(element.source, printData)
  if (!asset?.base64) {
    // 画像は差し替えられないため、hideWhenEmpty によらず出力しない
    return []
  }
  return [
    { type: 'setAlignment', alignment: element.alignment },
    {
      type: 'printImage',
      base64: asset.base64,
      width: element.width,
      imageType: element.imageType,
    },
  ]
}

const qrCodeCommands = (
  element: QRCodeElement,
  printData: PrintData | undefined,
): PrintCommand[] => {
  const text = resolveText(element.source, printData)
  if (isBlank(text)) {
    // 空文字はQRコードに変換できない
    return []
  }
  return [
    { type: 'setAlignment', alignment: element.alignment },
    {
      type: 'printQRCode',
      text,
      moduleSize: element.moduleSize,
      errorLevel: element.errorLevel,
    },
  ]
}

const columnsCommands = (
  element: ColumnsElement,
  printData: PrintData | undefined,
): PrintCommand[] => {
  if (element.columns.length === 0) {
    return []
  }

  const texts = element.columns.map(({ source }) =>
    resolveText(source, printData),
  )

  if (element.hideWhenEmpty) {
    // ラベルなどの固定値は判定に含めず、入力した値だけで空行か判断する
    const filled = element.columns
      .map((column, index) => ({ column, text: texts[index] }))
      .filter(({ column }) => column.source.kind === 'field')
    if (filled.length > 0 && filled.every(({ text }) => isBlank(text))) {
      return []
    }
  }

  return [
    {
      type: 'printColumns',
      texts,
      widths: element.columns.map(({ width }) => width),
      alignments: element.columns.map(({ alignment }) => alignment),
    },
  ]
}

const timestampCommands = (
  element: TimestampElement,
  printedAt: number,
): PrintCommand[] => [
  { type: 'setAlignment', alignment: element.alignment },
  {
    type: 'printText',
    text: dayjs(printedAt).locale('ja').format(element.format),
  },
]

const elementCommands = (
  element: LayoutElement,
  printData: PrintData | undefined,
  printedAt: number,
): PrintCommand[] => {
  switch (element.type) {
    case 'text':
      return textCommands(element, printData)
    case 'image':
      return imageCommands(element, printData)
    case 'qrcode':
      return qrCodeCommands(element, printData)
    case 'columns':
      return columnsCommands(element, printData)
    case 'divider':
      return [{ type: 'printHR', barType: element.barType }]
    case 'spacer':
      return [{ type: 'lineWrap', count: element.lines }]
    case 'timestamp':
      return timestampCommands(element, printedAt)
  }
}

/**
 * レイアウトと印刷データから、プリンターへ送る操作の並びを組み立てる
 *
 * ネイティブへは触れない純粋関数として、実機なしで検証できるようにしている。
 */
export const buildPrintCommands = (
  layout: Layout,
  printData?: PrintData,
  { printedAt = dayjs().valueOf() }: BuildPrintCommandsOptions = {},
): PrintCommand[] => {
  const commands = layout.elements.flatMap((element) =>
    elementCommands(element, printData, printedAt),
  )

  if (commands.length === 0) {
    return []
  }

  return [...commands, { type: 'lineWrap', count: FEED_LINE_COUNT }]
}
