import {
  type RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import type { Layout, PrintData } from '@/print'
import { createPrintData } from '@/print'
import { selectDatabaseIsReady } from '@/redux/modules/database/selectors'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { selectPrintDataByLayoutId } from '@/redux/modules/printData/selectors'
import {
  deletePrintData,
  duplicatePrintData,
  fetchPrintData,
  printLayout,
  savePrintData,
} from '@/redux/modules/printData/slice'
import type { MainParams } from '@/routes/main.params'
import { formatDateTime } from '@/utils/day'
import { styleType } from '@/utils/styles'

type ParamsProps = RouteProp<MainParams, 'PrintDataList'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  printData: PrintData[]
  isDialogVisible: boolean
  onPressPrintData: (value: PrintData) => void
  onLongPressPrintData: (value: PrintData) => void
  onPressAdd: () => void
  onSubmitTitle: (title: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  printData,
  isDialogVisible,
  onPressPrintData,
  onLongPressPrintData,
  onPressAdd,
  onSubmitTitle,
  onCancelDialog,
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
    <>
      <ScrollView style={styles.scrollView}>
        <Section title="印刷データ">
          {printData.length === 0 ? (
            <Cell
              title="印刷データがありません"
              description="下の「印刷データを追加する」から作成してください"
              inactive={true}
            />
          ) : (
            printData.map((value) => (
              <Cell
                key={value.id}
                title={value.title}
                description={formatDateTime(value.updatedAt)}
                accessory="disclosure"
                onPress={() => onPressPrintData(value)}
                onLongPress={() => onLongPressPrintData(value)}
              />
            ))
          )}
        </Section>
        <Section title="操作">
          <Cell
            title="印刷データを追加する"
            description={
              layout.fields.length === 0
                ? 'このレイアウトには差し込み口がないため、入力する項目はありません'
                : 'セルを長押しすると複製と削除ができます'
            }
            onPress={onPressAdd}
          />
        </Section>
      </ScrollView>
      <InputDialog
        isVisible={isDialogVisible}
        title="印刷データの追加"
        description="名前を入力してください"
        onPress={onSubmitTitle}
        onCancel={onCancelDialog}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const isFocused = useIsFocused()

  const {
    params: { layoutId },
  } = useRoute<ParamsProps>()

  const layoutSelector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const printDataSelector = useMemo(
    () => selectPrintDataByLayoutId(layoutId),
    [layoutId],
  )
  const layout = useSelector(layoutSelector)
  const printData = useSelector(printDataSelector)
  const isDatabaseReady = useSelector(selectDatabaseIsReady)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: '印刷データ' })
  }, [navigation])

  useEffect(() => {
    if (isFocused && isDatabaseReady) {
      dispatch(fetchPrintData())
    }
  }, [dispatch, isFocused, isDatabaseReady])

  const onPressPrintData = useCallback(
    (value: PrintData) => {
      navigation.navigate('PrintDataForm', {
        layoutId,
        printDataId: value.id,
      })
    },
    [layoutId, navigation],
  )

  const onLongPressPrintData = useCallback(
    async (value: PrintData) => {
      try {
        const action = await AlertAsync(value.title, '操作を選んでください', [
          { text: '印刷する', onPress: () => 'print' },
          { text: '複製する', onPress: () => 'duplicate' },
          { text: '削除する', onPress: () => 'delete', style: 'destructive' },
        ])

        if (action === 'print') {
          dispatch(printLayout({ layoutId, printDataId: value.id }))
          return
        }

        if (action === 'duplicate') {
          dispatch(duplicatePrintData(value))
          return
        }

        if (action === 'delete') {
          const confirmed = await AlertAsync(
            '確認',
            `「${value.title}」を削除しますか？`,
            [
              { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
              { text: MESSAGE.YES, onPress: () => true },
            ],
          )
          if (confirmed) {
            dispatch(deletePrintData(value))
          }
        }
      } catch (e: any) {
        console.warn('onLongPressPrintData', e)
      }
    },
    [dispatch, layoutId],
  )

  const onPressAdd = useCallback(() => setIsDialogVisible(true), [])
  const onCancelDialog = useCallback(() => setIsDialogVisible(false), [])

  const onSubmitTitle = useCallback(
    (title: string) => {
      setIsDialogVisible(false)
      const value = createPrintData(
        layoutId,
        title.trim() || '新しい印刷データ',
      )
      dispatch(savePrintData(value))
      navigation.navigate('PrintDataForm', {
        layoutId,
        printDataId: value.id,
      })
    },
    [dispatch, layoutId, navigation],
  )

  return (
    <Component
      {...props}
      {...{
        layout,
        printData,
        isDialogVisible,
        onPressPrintData,
        onLongPressPrintData,
        onPressAdd,
        onSubmitTitle,
        onCancelDialog,
      }}
    />
  )
}

export { Container as PrintDataList }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
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
