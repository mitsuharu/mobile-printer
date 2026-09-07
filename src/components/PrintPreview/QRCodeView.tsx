import qrcode from 'qrcode-generator'
import type React from 'react'
import { useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { styleType } from '@/utils/styles'

type Props = {
  text: string
  /**
   * QRコードの1マスの大きさ（印刷時のドット数）
   */
  moduleSize: number
}

type Run = { start: number; length: number }

/**
 * 1行分の黒いマスを、連続する区間へまとめる
 *
 * マスごとに View を置くと数千個になるため、横に連なる部分をまとめて描く。
 */
const toRuns = (isDark: (index: number) => boolean, count: number): Run[] => {
  const runs: Run[] = []
  let start = -1

  for (let index = 0; index < count; index += 1) {
    if (isDark(index)) {
      if (start < 0) {
        start = index
      }
    } else if (start >= 0) {
      runs.push({ start, length: index - start })
      start = -1
    }
  }
  if (start >= 0) {
    runs.push({ start, length: count - start })
  }

  return runs
}

/**
 * プレビュー用のQRコード
 */
export const QRCodeView: React.FC<Props> = ({ text, moduleSize }) => {
  const matrix = useMemo(() => {
    try {
      const qr = qrcode(0, 'L')
      qr.addData(text)
      qr.make()
      const count = qr.getModuleCount()
      return {
        count,
        rows: Array.from({ length: count }, (_, row) =>
          toRuns((column) => qr.isDark(row, column), count),
        ),
      }
    } catch (e: any) {
      console.warn('QRCodeView', e)
      return undefined
    }
  }, [text])

  if (!matrix) {
    return null
  }

  const size = matrix.count * moduleSize

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {matrix.rows.map((runs, row) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 行番号そのものが位置を表す
        <View key={row} style={styles.row}>
          {runs.map((run) => (
            <View
              key={`${row}-${run.start}`}
              style={[
                styles.module,
                {
                  left: run.start * moduleSize,
                  top: row * moduleSize,
                  width: run.length * moduleSize,
                  height: moduleSize,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: styleType<ViewStyle>({
    backgroundColor: 'white',
  }),
  row: styleType<ViewStyle>({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }),
  module: styleType<ViewStyle>({
    position: 'absolute',
    backgroundColor: 'black',
  }),
})
