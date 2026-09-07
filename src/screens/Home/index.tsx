import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { Cell, Section } from '@/components/List'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SafeScrollView } from '@/components/SafeScrollView'
import { SeasonalAsciiArtSection } from '@/components/SeasonalAsciiArtSection'
import type { Layout, PrintData } from '@/print'
import {
  selectLayoutIsLoading,
  selectLayouts,
} from '@/redux/modules/layout/selectors'
import { selectAllPrintData } from '@/redux/modules/printData/selectors'
import { printLayout } from '@/redux/modules/printData/slice'
import { printText } from '@/redux/modules/printer/slice'
import { styleType } from '@/utils/styles'
import { InputDialogCell } from './InputDialogCell'
import { PrintDataCell } from './PrintDataCell'

type Props = {}
type ComponentProps = Props & {
  isLoading: boolean
  printData: PrintData[]
  layoutNames: Record<string, string>
  onPressText: (text: string) => void
  onPressPrintData: (value: PrintData) => void
  onPressEditPrintData: (value: PrintData) => void
  onNavigateToPrinter: () => void
  onNavigateToLayoutList: () => void
}

const Component: React.FC<ComponentProps> = ({
  isLoading,
  printData,
  layoutNames,
  onPressText,
  onPressPrintData,
  onPressEditPrintData,
  onNavigateToPrinter,
  onNavigateToLayoutList,
}) => {
  const styles = useStyles()

  return (
    <>
      <SafeScrollView style={styles.scrollView}>
        <SeasonalAsciiArtSection />
        <Section title="汎用印刷">
          <InputDialogCell
            title="テキストを印刷する"
            dialogTitle="テキスト印刷"
            dialogDescription="印刷するテキストを入力してください"
            onSelectText={onPressText}
          />
          <Cell
            title="その他"
            onPress={onNavigateToPrinter}
            accessory="disclosure"
          />
        </Section>
        <Section title="レイアウト印刷">
          {printData.length === 0 ? (
            <Cell
              title="印刷データがありません"
              description="「レイアウトを管理する」から作成してください"
              inactive={true}
            />
          ) : (
            printData.map((value) => (
              <PrintDataCell
                key={value.id}
                printData={value}
                layoutName={layoutNames[value.layoutId]}
                onPressPrint={onPressPrintData}
                onPressEdit={onPressEditPrintData}
              />
            ))
          )}
        </Section>
        <Section title="レイアウト印刷のオプション">
          <Cell
            title="レイアウトを管理する"
            description="レイアウトの作成・編集と、印刷データの入力"
            onPress={onNavigateToLayoutList}
            accessory="disclosure"
          />
        </Section>
      </SafeScrollView>
      <LoadingSpinner isLoading={isLoading} />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isLoading = useSelector(selectLayoutIsLoading)
  const layouts: Layout[] = useSelector(selectLayouts)
  const printData: PrintData[] = useSelector(selectAllPrintData)

  const layoutNames = useMemo(
    () => Object.fromEntries(layouts.map((layout) => [layout.id, layout.name])),
    [layouts],
  )

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'モバイル印刷 for SUNMI' })
  }, [navigation])

  const onPressText = useCallback(
    (text: string) => {
      dispatch(printText({ text: text, size: 'default' }))
    },
    [dispatch],
  )

  const onPressPrintData = useCallback(
    (value: PrintData) => {
      dispatch(printLayout({ layoutId: value.layoutId, printDataId: value.id }))
    },
    [dispatch],
  )

  const onPressEditPrintData = useCallback(
    (value: PrintData) => {
      navigation.navigate('PrintDataForm', {
        layoutId: value.layoutId,
        printDataId: value.id,
      })
    },
    [navigation],
  )

  const onNavigateToPrinter = useCallback(() => {
    navigation.navigate('Printer')
  }, [navigation])

  const onNavigateToLayoutList = useCallback(() => {
    navigation.navigate('LayoutList')
  }, [navigation])

  return (
    <Component
      {...props}
      {...{
        isLoading,
        printData,
        layoutNames,
        onPressText,
        onPressPrintData,
        onPressEditPrintData,
        onNavigateToPrinter,
        onNavigateToLayoutList,
      }}
    />
  )
}

export { Container as Home }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
