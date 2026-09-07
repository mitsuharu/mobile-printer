import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { BASE64 } from '@/CONSTANTS'
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
  printHR: (barType: SunmiPrinterLibrary.BarType) => void
  lineWrap: (count: number) => void
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
  printQRCode: (text, moduleSize, errorLevel) =>
    SunmiPrinterLibrary.printQRCode(text, moduleSize, errorLevel),
  printColumnsString: (texts, widths, alignments) =>
    SunmiPrinterLibrary.printColumnsString(texts, widths, alignments),
  printHR: (barType) => SunmiPrinterLibrary.printHR(barType),
  lineWrap: (count) => SunmiPrinterLibrary.lineWrap(count),
}

/**
 * 組み立てた操作をプリンターへ送る
 */
export const executePrintCommands = (
  commands: PrintCommand[],
  printer: Printer = defaultPrinter,
): void => {
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
      case 'printImage':
        printer.printImage(command.base64, command.width, command.imageType)
        break
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
      case 'printHR':
        printer.printHR(command.barType)
        break
      case 'lineWrap':
        printer.lineWrap(command.count)
        break
    }
  }
}
