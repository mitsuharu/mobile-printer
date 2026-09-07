import type {
  Alignment,
  BarType,
  PrintImageType,
} from '@mitsuharu/react-native-sunmi-printer-library'
import { FONT_SIZE } from '@/CONSTANTS'
import type { PrintCommand } from '@/print'

export type PreviewRow =
  | {
      type: 'text'
      text: string
      fontSize: number
      bold: boolean
      underline: boolean
      alignment: Alignment
    }
  | {
      type: 'image'
      path: string
      width: number
      imageType: PrintImageType
      alignment: Alignment
    }
  | {
      type: 'qrcode'
      text: string
      moduleSize: number
      alignment: Alignment
    }
  | {
      type: 'columns'
      texts: string[]
      widths: number[]
      alignments: Alignment[]
      fontSize: number
    }
  | { type: 'divider'; barType: BarType }
  | { type: 'blank'; count: number }

type PrintStyle = {
  alignment: Alignment
  fontSize: number
  bold: boolean
  underline: boolean
}

const initialStyle: PrintStyle = {
  alignment: 'left',
  fontSize: FONT_SIZE.DEFAULT,
  bold: false,
  underline: false,
}

/**
 * プリンターへ送る操作を、画面に描ける行へ組み直す
 *
 * 印刷と同じ `PrintCommand[]` を入力にしているため、プレビューと実際の印刷が
 * 同じ解釈を共有する。
 */
export const buildPreviewRows = (commands: PrintCommand[]): PreviewRow[] => {
  const style = { ...initialStyle }
  const rows: PreviewRow[] = []

  for (const command of commands) {
    switch (command.type) {
      case 'setAlignment':
        style.alignment = command.alignment
        break
      case 'setFontSize':
        style.fontSize = command.size
        break
      case 'setTextStyle':
        if (command.style === 'bold') {
          style.bold = command.enabled
        }
        if (command.style === 'underline') {
          style.underline = command.enabled
        }
        break
      case 'printText':
        rows.push({
          type: 'text',
          text: command.text,
          fontSize: style.fontSize,
          bold: style.bold,
          underline: style.underline,
          alignment: style.alignment,
        })
        break
      case 'printImage':
        rows.push({
          type: 'image',
          path: command.path,
          width: command.width,
          imageType: command.imageType,
          alignment: style.alignment,
        })
        break
      case 'printQRCode':
        rows.push({
          type: 'qrcode',
          text: command.text,
          moduleSize: command.moduleSize,
          alignment: style.alignment,
        })
        break
      case 'printColumns':
        rows.push({
          type: 'columns',
          texts: command.texts,
          widths: command.widths,
          alignments: command.alignments,
          fontSize: style.fontSize,
        })
        break
      case 'printHR':
        rows.push({ type: 'divider', barType: command.barType })
        break
      case 'lineWrap':
        rows.push({ type: 'blank', count: command.count })
        break
    }
  }

  return rows
}
