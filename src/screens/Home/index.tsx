import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { ICON, MESSAGE } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  type ListPickerItem,
  ListPickerModal,
} from '@/components/Modal/ListPickerModal'
import { SafeScrollView } from '@/components/SafeScrollView'
import type { Layout, PrintData } from '@/print'
import {
  selectLayoutIsLoading,
  selectLayouts,
} from '@/redux/modules/layout/selectors'
import { selectAllPrintData } from '@/redux/modules/printData/selectors'
import {
  deletePrintData,
  duplicatePrintData,
  printLayout,
} from '@/redux/modules/printData/slice'
import { printText } from '@/redux/modules/printer/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { styleType } from '@/utils/styles'
import { AppInfoButton } from './AppInfoButton'
import { InputDialogCell } from './InputDialogCell'
import { PrintDataCell } from './PrintDataCell'

/**
 * 印刷データを長押ししたときに選べる操作
 */
type PrintDataAction = 'duplicate' | 'delete'

const printDataActions: ListPickerItem<PrintDataAction>[] = [
  { value: 'duplicate', title: 'Duplicate' },
  { value: 'delete', title: 'Delete' },
]

type Props = {}
type ComponentProps = Props & {
  isLoading: boolean
  printData: PrintData[]
  layoutNames: Record<string, string>
  actionTarget: PrintData | undefined
  onPressText: (text: string) => void
  onPressPrintData: (value: PrintData) => void
  onPressEditPrintData: (value: PrintData) => void
  onLongPressPrintData: (value: PrintData) => void
  onSelectAction: (action: PrintDataAction) => void
  onCancelAction: () => void
  onNavigateToPrinter: () => void
  onNavigateToLayoutList: () => void
}

const Component: React.FC<ComponentProps> = ({
  isLoading,
  printData,
  layoutNames,
  actionTarget,
  onPressText,
  onPressPrintData,
  onPressEditPrintData,
  onLongPressPrintData,
  onSelectAction,
  onCancelAction,
  onNavigateToPrinter,
  onNavigateToLayoutList,
}) => {
  const styles = useStyles()

  return (
    <>
      <SafeScrollView style={styles.scrollView}>
        <Section title="Quick print">
          <InputDialogCell
            title="Print text"
            dialogTitle="Text printing"
            dialogDescription="Enter the text to print"
            onSelectText={onPressText}
          />
          <Cell
            title="More printing options"
            onPress={onNavigateToPrinter}
            accessory="disclosure"
          />
        </Section>
        <Section title="Layout printing">
          {printData.length === 0 ? (
            <Cell
              title="No print data"
              description="Create print data from Manage layouts"
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
                onLongPress={onLongPressPrintData}
              />
            ))
          )}
        </Section>
        <Section title="Layout options">
          <Cell
            title="Manage layouts"
            description="Create and edit layouts, and enter print data"
            icon={ICON.LAYOUT}
            onPress={onNavigateToLayoutList}
            accessory="disclosure"
          />
        </Section>
      </SafeScrollView>
      <LoadingSpinner isLoading={isLoading} />
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

  const isLoading = useSelector(selectLayoutIsLoading)
  const layouts: Layout[] = useSelector(selectLayouts)
  const printData: PrintData[] = useSelector(selectAllPrintData)

  const [actionTarget, setActionTarget] = useState<PrintData | undefined>(
    undefined,
  )

  const layoutNames = useMemo(
    () => Object.fromEntries(layouts.map((layout) => [layout.id, layout.name])),
    [layouts],
  )

  const onNavigateToAppInfo = useCallback(() => {
    navigation.navigate('AppInfo')
  }, [navigation])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Mobile Print for SUNMI',
      headerRight: () => <AppInfoButton onPress={onNavigateToAppInfo} />,
    })
  }, [navigation, onNavigateToAppInfo])

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
    [actionTarget, dispatch],
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
        actionTarget,
        onPressText,
        onPressPrintData,
        onPressEditPrintData,
        onLongPressPrintData,
        onSelectAction,
        onCancelAction,
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
