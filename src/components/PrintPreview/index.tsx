import type { Alignment } from '@mitsuharu/react-native-sunmi-printer-library'
import type React from 'react'
import { useMemo } from 'react'
import {
  Image,
  type ImageStyle,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native'
import { BASE64 } from '@/CONSTANTS'
import type { PrintCommand } from '@/print'
import { styleType } from '@/utils/styles'
import { QRCodeView } from './QRCodeView'
import { buildPreviewRows, type PreviewRow } from './rows'

export * from './previewData'
export * from './rows'

type Props = {
  commands: PrintCommand[]
  /**
   * 用紙の印刷可能な幅（ドット）
   */
  paperPixelWidth?: number
}

const barCharacters: Record<string, string> = {
  line: '─',
  double: '═',
  dots: '·',
  wave: '~',
  plus: '+',
  star: '*',
}

const toFlex = (alignment: Alignment) => {
  switch (alignment) {
    case 'left':
      return 'flex-start'
    case 'right':
      return 'flex-end'
    default:
      return 'center'
  }
}

const toTextAlign = (alignment: Alignment) => alignment

/**
 * 等幅フォントの1文字の送り幅（フォントサイズに対する比）
 */
const MONOSPACE_ADVANCE_RATIO = 0.6

/**
 * プリンターにおける半角1文字あたりのドット数
 *
 * 58mm(384ドット)に既定のフォント(24)で32文字並ぶことから、文字サイズの半分とする。
 */
const characterWidth = (printerFontSize: number) => printerFontSize / 2

/**
 * プリンターの文字サイズを、画面で同じ字送りになるフォントサイズへ換算する
 *
 * そのまま同じ数値で描くと、等幅フォントの送り幅の分だけ横に広がり、
 * 1行に入る文字数が実際の印刷とずれる。
 */
const previewFontSize = (printerFontSize: number) =>
  characterWidth(printerFontSize) / MONOSPACE_ADVANCE_RATIO

const Row: React.FC<{ row: PreviewRow; paperPixelWidth: number }> = ({
  row,
  paperPixelWidth,
}) => {
  switch (row.type) {
    case 'text':
      return (
        <Text
          style={[
            styles.text,
            {
              fontSize: previewFontSize(row.fontSize),
              lineHeight: row.fontSize * 1.2,
              fontWeight: row.bold ? 'bold' : 'normal',
              textDecorationLine: row.underline ? 'underline' : 'none',
              textAlign: toTextAlign(row.alignment),
            },
          ]}
        >
          {row.text}
        </Text>
      )
    case 'image':
      return (
        <View style={{ alignItems: toFlex(row.alignment) }}>
          <Image
            // ファイルのまま渡すと、Base64 の復号を経ずにネイティブで描画できる
            source={{ uri: `file://${row.path}` }}
            style={[styles.image, { width: row.width, height: row.width }]}
            resizeMode="contain"
          />
        </View>
      )
    case 'qrcode':
      return (
        <View style={{ alignItems: toFlex(row.alignment) }}>
          <QRCodeView text={row.text} moduleSize={row.moduleSize} />
        </View>
      )
    case 'columns':
      return (
        <View style={styles.columns}>
          {row.texts.map((text, index) => (
            <Text
              key={`${index}-${text}`}
              numberOfLines={1}
              ellipsizeMode="clip"
              style={[
                styles.text,
                {
                  width:
                    (row.widths[index] ?? 0) * characterWidth(row.fontSize),
                  fontSize: previewFontSize(row.fontSize),
                  lineHeight: row.fontSize * 1.2,
                  textAlign: toTextAlign(row.alignments[index] ?? 'left'),
                },
              ]}
            >
              {text}
            </Text>
          ))}
        </View>
      )
    case 'divider': {
      const character = barCharacters[row.barType] ?? '─'
      // 端まで引ききるよう多めに並べ、はみ出した分は切り落とす
      const count = Math.ceil(paperPixelWidth / characterWidth(24)) + 2
      return (
        <Text
          numberOfLines={1}
          ellipsizeMode="clip"
          style={[styles.text, styles.divider]}
        >
          {character.repeat(count)}
        </Text>
      )
    }
    case 'blank':
      return <View style={{ height: row.count * 24 * 1.2 }} />
  }
}

/**
 * 印刷結果のプレビュー
 *
 * 印刷と同じ `PrintCommand[]` を描き直すため、実際の出力とずれにくい。
 * 用紙の幅で描いたうえで、画面に収まるよう縮小する。
 */
export const PrintPreview: React.FC<Props> = ({
  commands,
  paperPixelWidth = BASE64.MAX_SIZE,
}) => {
  const rows = useMemo(() => buildPreviewRows(commands), [commands])

  return (
    <View style={[styles.paper, { width: paperPixelWidth }]}>
      {rows.map((row, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 行の位置そのものが並び順を表す
        <Row key={index} row={row} paperPixelWidth={paperPixelWidth} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  paper: styleType<ViewStyle>({
    backgroundColor: 'white',
    paddingVertical: 8,
  }),
  text: styleType<TextStyle>({
    color: 'black',
    fontFamily: 'monospace',
  }),
  divider: styleType<TextStyle>({
    fontSize: 20,
    lineHeight: 24 * 1.2,
  }),
  columns: styleType<ViewStyle>({
    flexDirection: 'row',
  }),
  image: styleType<ImageStyle>({
    resizeMode: 'contain',
  }),
})
