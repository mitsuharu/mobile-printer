import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useLayoutEffect, useMemo, useState } from 'react'
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import { useSelector } from 'react-redux'
import { BASE64, COLOR } from '@/CONSTANTS'
import { createPreviewPrintData, PrintPreview } from '@/components/PrintPreview'
import type { Layout, PrintCommand, PrintData } from '@/print'
import { buildPrintCommands } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { selectPrintDataById } from '@/redux/modules/printData/selectors'
import { selectPrinterInfo } from '@/redux/modules/printer/selectors'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'

type ParamsProps = RouteProp<MainParams, 'LayoutPreview'>

/**
 * プレビューの左右の余白
 */
const HORIZONTAL_PADDING = 16

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  isPlaceholder: boolean
  commands: PrintCommand[]
  paperPixelWidth: number
  scale: number
  onLayout: (event: LayoutChangeEvent) => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  isPlaceholder,
  commands,
  paperPixelWidth,
  scale,
  onLayout,
}) => {
  const styles = useStyles()

  if (!layout) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>レイアウトが見つかりません</Text>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
      onLayout={onLayout}
    >
      <Text style={styles.notice}>
        これは画面上のイメージです。実際の印刷結果とは、文字の形や行の詰まり方が
        異なることがあります。
      </Text>
      <Text style={styles.description}>
        用紙の幅 {paperPixelWidth}px で描いています。
        {isPlaceholder ? '入力項目は表示名を仮の値として入れています。' : null}
      </Text>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {commands.length === 0 ? (
          <Text style={styles.emptyText}>印刷される内容がありません</Text>
        ) : (
          <View
            style={{
              width: paperPixelWidth * scale,
              // 縮小したぶん高さが余るため、原点を左上に固定して詰める
              transform: [{ scale }],
              transformOrigin: 'top left',
            }}
          >
            <PrintPreview
              commands={commands}
              paperPixelWidth={paperPixelWidth}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()

  const {
    params: { layoutId, printDataId },
  } = useRoute<ParamsProps>()

  const layoutSelector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const printDataSelector = useMemo(
    () => selectPrintDataById(printDataId),
    [printDataId],
  )
  const layout = useSelector(layoutSelector)
  const printData: PrintData | undefined = useSelector(printDataSelector)
  const printerInfo = useSelector(selectPrinterInfo)

  const paperPixelWidth = printerInfo?.pixelWidth ?? BASE64.MAX_SIZE

  const [availableWidth, setAvailableWidth] = useState<number>(0)

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'プレビュー' })
  }, [navigation])

  const commands = useMemo(() => {
    if (!layout) {
      return []
    }
    // 印刷データを指定されていなければ、入力項目へ仮の値を入れて体裁を見せる
    return buildPrintCommands(
      layout,
      printData ?? createPreviewPrintData(layout),
    )
  }, [layout, printData])

  const scale = useMemo(() => {
    const usable = availableWidth - HORIZONTAL_PADDING * 2
    if (usable <= 0) {
      return 1
    }
    return Math.min(1, usable / paperPixelWidth)
  }, [availableWidth, paperPixelWidth])

  const onLayout = (event: LayoutChangeEvent) => {
    setAvailableWidth(event.nativeEvent.layout.width)
  }

  return (
    <Component
      {...props}
      {...{
        layout,
        isPlaceholder: !printData,
        commands,
        paperPixelWidth,
        scale,
        onLayout,
      }}
    />
  )
}

export { Container as LayoutPreview }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
    }),
    contentContainer: styleType<ViewStyle>({
      padding: HORIZONTAL_PADDING,
      alignItems: 'flex-start',
    }),
    notice: styleType<TextStyle>({
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 12,
      fontSize: 12,
      fontWeight: 'bold',
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    description: styleType<TextStyle>({
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 4,
      fontSize: 12,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    empty: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }),
    emptyText: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
  })
  return styles
})
