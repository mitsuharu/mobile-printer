import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { BASE64 } from '@/CONSTANTS'
import { readImageFile } from '@/utils/imageStore'
import type { PrintCommand } from './commands'

/**
 * プリンターを操作する範囲
 *
 * @note
 * `SunmiPrinterLibrary` のうち、この処理が使うものだけを切り出している。
 * こうしておくと、実機なしで呼び出し順を検証できる。
 */
export type Printer = {
  setAlignment: (alignment: SunmiPrinterLibrary.Alignment) => void
  setFontSize: (size: number) => void
  setTextStyle: (style: SunmiPrinterLibrary.TextStyle, enabled: boolean) => void
  printText: (text: string) => void
  printImage: (
    base64: string,
    width: number,
    type: SunmiPrinterLibrary.PrintImageType,
  ) => void

  /**
   * 保存した画像を Base64 で読む
   */
  readImage: (path: string) => Promise<string>
  printQRCode: (
    text: string,
    moduleSize: number,
    errorLevel: SunmiPrinterLibrary.QRErrorLevel,
  ) => void
  printColumnsString: (
    texts: string[],
    widths: number[],
    alignments: SunmiPrinterLibrary.Alignment[],
  ) => void
  /**
   * 区切り線の文字列を作る
   *
   * @note
   * 用紙幅をプリンターへ問い合わせる。バッファへ入ったあとは応答が返らず
   * 固まるため、入る前に呼ぶこと。
   */
  buildHR: (barType: SunmiPrinterLibrary.BarType) => Promise<string>

  /**
   * 区切り線を印字する
   *
   * @note
   * 用紙幅いっぱいの記号なので、直前の要素が文字を大きくしていても
   * 既定の大きさで印字する。
   */
  printHR: (text: string) => void
  lineWrap: (count: number) => void

  /**
   * 1件の印刷をまとめて送るための、プリンターのバッファ
   */
  enterBuffer: () => Promise<void>
  exitBuffer: () => Promise<void>
}

/**
 * @package
 */
export const defaultPrinter: Printer = {
  setAlignment: (alignment) => SunmiPrinterLibrary.setAlignment(alignment),
  setFontSize: (size) => SunmiPrinterLibrary.setFontSize(size),
  setTextStyle: (style, enabled) =>
    SunmiPrinterLibrary.setTextStyle(style, enabled),
  printText: (text) => SunmiPrinterLibrary.printText(text),
  printImage: (base64, width, type) =>
    SunmiPrinterLibrary.printImage(BASE64.PREFIX + base64, width, type),
  readImage: (path) => readImageFile(path),
  printQRCode: (text, moduleSize, errorLevel) =>
    SunmiPrinterLibrary.printQRCode(text, moduleSize, errorLevel),
  printColumnsString: (texts, widths, alignments) =>
    SunmiPrinterLibrary.printColumnsString(texts, widths, alignments),
  buildHR: (barType) => SunmiPrinterLibrary.hr(barType),
  printHR: (text) =>
    SunmiPrinterLibrary.printTextWithFont(
      text,
      'default',
      SunmiPrinterLibrary.defaultFontSize,
    ),
  lineWrap: (count) => SunmiPrinterLibrary.lineWrap(count),
  enterBuffer: () => SunmiPrinterLibrary.enterPrinterBuffer(true),
  exitBuffer: () => SunmiPrinterLibrary.exitPrinterBuffer(true),
}

/**
 * 区切り線の文字列を、種類ごとに作っておく
 *
 * @note
 * 用紙幅の問い合わせはプリンターのバッファ中に応答が返らない。送り始める
 * 前にまとめて作る。
 */
const buildHRTexts = async (
  commands: PrintCommand[],
  printer: Printer,
): Promise<Map<SunmiPrinterLibrary.BarType, string>> => {
  const texts = new Map<SunmiPrinterLibrary.BarType, string>()
  for (const command of commands) {
    if (command.type === 'printHR' && !texts.has(command.barType)) {
      texts.set(command.barType, await printer.buildHR(command.barType))
    }
  }
  return texts
}

/**
 * 組み立てた操作をプリンターへ送る
 *
 * 画像はパスで受け取り、送る直前にファイルから読む。
 * 割り込みを防ぐため、1件の印刷はバッファへまとめて送る。
 */
export const executePrintCommands = async (
  commands: PrintCommand[],
  printer: Printer = defaultPrinter,
): Promise<void> => {
  // 送るものがなければ、バッファの開け閉めもしない
  if (commands.length === 0) {
    return
  }

  const hrTexts = await buildHRTexts(commands, printer)

  await printer.enterBuffer()
  try {
    await send(commands, printer, hrTexts)
  } finally {
    await printer.exitBuffer()
  }
}

const send = async (
  commands: PrintCommand[],
  printer: Printer,
  hrTexts: Map<SunmiPrinterLibrary.BarType, string>,
): Promise<void> => {
  for (const command of commands) {
    switch (command.type) {
      case 'setAlignment':
        printer.setAlignment(command.alignment)
        break
      case 'setFontSize':
        printer.setFontSize(command.size)
        break
      case 'setTextStyle':
        printer.setTextStyle(command.style, command.enabled)
        break
      case 'printText':
        printer.printText(command.text)
        break
      case 'printImage': {
        const base64 = await printer.readImage(command.path)
        printer.printImage(base64, command.width, command.imageType)
        break
      }
      case 'printQRCode':
        printer.printQRCode(
          command.text,
          command.moduleSize,
          command.errorLevel,
        )
        break
      case 'printColumns':
        printer.printColumnsString(
          command.texts,
          command.widths,
          command.alignments,
        )
        break
      case 'printHR': {
        const text = hrTexts.get(command.barType)
        if (text) {
          printer.printHR(text)
        }
        break
      }
      case 'lineWrap':
        printer.lineWrap(command.count)
        break
    }
  }
}
