import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
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
import { COLOR, ICON, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  type ListPickerItem,
  ListPickerModal,
} from '@/components/Modal/ListPickerModal'
import { SafeScrollView } from '@/components/SafeScrollView'
import type { Layout, PrintData } from '@/print'
import { createPrintData } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import {
  selectPrintDataByLayoutId,
  selectPrintDataIsLoading,
} from '@/redux/modules/printData/selectors'
import {
  deletePrintData,
  duplicatePrintData,
  printLayout,
  savePrintData,
} from '@/redux/modules/printData/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { MainParams } from '@/routes/main.params'
import { formatDateTime } from '@/utils/day'
import { styleType } from '@/utils/styles'

type ParamsProps = RouteProp<MainParams, 'PrintDataList'>

/**
 * 印刷データを長押ししたときに選べる操作
 */
type PrintDataAction = 'print' | 'duplicate' | 'delete'

const printDataActions: ListPickerItem<PrintDataAction>[] = [
  { value: 'print', title: 'Print' },
  { value: 'duplicate', title: 'Duplicate' },
  { value: 'delete', title: 'Delete' },
]

type Props = {}
type ComponentProps = Props & {
  isLoading: boolean
  layout: Layout | undefined
  printData: PrintData[]
  isDialogVisible: boolean
  actionTarget: PrintData | undefined
  onPressPrintData: (value: PrintData) => void
  onLongPressPrintData: (value: PrintData) => void
  onSelectAction: (action: PrintDataAction) => void
  onCancelAction: () => void
  onPressAdd: () => void
  onSubmitTitle: (title: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  isLoading,
  layout,
  printData,
  isDialogVisible,
  actionTarget,
  onPressPrintData,
  onLongPressPrintData,
  onSelectAction,
  onCancelAction,
  onPressAdd,
  onSubmitTitle,
  onCancelDialog,
}) => {
  const styles = useStyles()

  if (!layout) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{'Layout not found'}</Text>
      </View>
    )
  }

  return (
    <>
      <SafeScrollView style={styles.scrollView}>
        <Section title="Print data">
          {printData.length === 0 ? (
            <Cell
              title="No print data"
              description="Tap Add print data below to create a record"
              inactive={true}
            />
          ) : (
            printData.map((value) => (
              <Cell
                key={value.id}
                title={value.title}
                description={formatDateTime(value.updatedAt)}
                icon={ICON.PRINT_DATA}
                accessory="disclosure"
                onPress={() => onPressPrintData(value)}
                onLongPress={() => onLongPressPrintData(value)}
              />
            ))
          )}
        </Section>
        <Section title="Actions">
          <Cell
            title="Add print data"
            description={
              layout.fields.length === 0
                ? 'This layout has no input fields to fill in'
                : 'Press and hold a row to print, duplicate or delete it'
            }
            onPress={onPressAdd}
          />
        </Section>
      </SafeScrollView>
      <LoadingSpinner isLoading={isLoading} />
      <InputDialog
        isVisible={isDialogVisible}
        title="Add print data"
        description="Enter a print record name"
        onPress={onSubmitTitle}
        onCancel={onCancelDialog}
      />
      <ListPickerModal
        visible={!!actionTarget}
        title={actionTarget?.title ?? ''}
        description="Choose an action"
        items={printDataActions}
        onSelect={onSelectAction}
        onCancel={onCancelAction}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

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
  const isLoading = useSelector(selectPrintDataIsLoading)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)
  const [actionTarget, setActionTarget] = useState<PrintData | undefined>(
    undefined,
  )

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Print data' })
  }, [navigation])

  const onPressPrintData = useCallback(
    (value: PrintData) => {
      navigation.navigate('PrintDataForm', {
        layoutId,
        printDataId: value.id,
      })
    },
    [layoutId, navigation],
  )

  const onLongPressPrintData = useCallback((value: PrintData) => {
    setActionTarget(value)
  }, [])

  const onCancelAction = useCallback(() => {
    setActionTarget(undefined)
  }, [])

  const onSelectAction = useCallback(
    async (action: PrintDataAction) => {
      const value = actionTarget
      setActionTarget(undefined)
      if (!value) {
        return
      }
      try {
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
            'Confirm',
            `Delete ${value.title}?`,
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
        console.warn('onSelectAction', e)
        dispatch(enqueueSnackbar({ message: 'Could not complete the action' }))
      }
    },
    [actionTarget, dispatch, layoutId],
  )

  const onPressAdd = useCallback(() => setIsDialogVisible(true), [])
  const onCancelDialog = useCallback(() => setIsDialogVisible(false), [])

  const onSubmitTitle = useCallback(
    (title: string) => {
      setIsDialogVisible(false)
      const value = createPrintData(
        layoutId,
        title.trim() || 'New print record',
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
        isLoading,
        layout,
        printData,
        isDialogVisible,
        actionTarget,
        onPressPrintData,
        onLongPressPrintData,
        onSelectAction,
        onCancelAction,
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
