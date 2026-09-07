import type {
  Alignment,
  BarType,
  PrintImageType,
  QRErrorLevel,
  TextStyle,
} from '@mitsuharu/react-native-sunmi-printer-library'

/**
 * プリンターへ送る操作をひとつ表す
 *
 * レイアウトの解釈（`buildPrintCommands`）と、実際のプリンター呼び出しを
 * この型で分けている。解釈側はネイティブに触らないため、実機なしで検証できる。
 */
export type PrintCommand =
  | { type: 'setAlignment'; alignment: Alignment }
  | { type: 'setFontSize'; size: number }
  | { type: 'setTextStyle'; style: TextStyle; enabled: boolean }
  | { type: 'printText'; text: string }
  | {
      type: 'printImage'
      base64: string
      width: number
      imageType: PrintImageType
    }
  | {
      type: 'printQRCode'
      text: string
      moduleSize: number
      errorLevel: QRErrorLevel
    }
  | {
      type: 'printColumns'
      texts: string[]
      widths: number[]
      alignments: Alignment[]
    }
  | { type: 'printHR'; barType: BarType }
  | { type: 'lineWrap'; count: number }
