import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useState } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { ICON, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SafeScrollView } from '@/components/SafeScrollView'
import type { Layout } from '@/print'
import { createLayout } from '@/print'
import {
  selectLayoutIsLoading,
  selectLayouts,
} from '@/redux/modules/layout/selectors'
import {
  deleteLayout,
  duplicateLayout,
  saveLayout,
} from '@/redux/modules/layout/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { formatDateTime } from '@/utils/day'
import { styleType } from '@/utils/styles'

type Props = {}
type ComponentProps = Props & {
  isLoading: boolean
  layouts: Layout[]
  isDialogVisible: boolean
  onPressLayout: (layout: Layout) => void
  onLongPressLayout: (layout: Layout) => void
  onPressAdd: () => void
  onSubmitName: (name: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  isLoading,
  layouts,
  isDialogVisible,
  onPressLayout,
  onLongPressLayout,
  onPressAdd,
  onSubmitName,
  onCancelDialog,
}) => {
  const styles = useStyles()

  return (
    <>
      <SafeScrollView style={styles.scrollView}>
        <Section title="Layout">
          {layouts.length === 0 ? (
            <Cell
              title="No layouts"
              description="Tap Add a layout below to create one"
              inactive={true}
            />
          ) : (
            layouts.map((layout) => (
              <Cell
                key={layout.id}
                title={layout.name}
                description={`${layout.elements.length} elements - ${formatDateTime(layout.updatedAt)}`}
                icon={ICON.LAYOUT}
                accessory="disclosure"
                onPress={() => onPressLayout(layout)}
                onLongPress={() => onLongPressLayout(layout)}
              />
            ))
          )}
        </Section>
        <Section title="Actions">
          <Cell
            title="Add a layout"
            description="Press and hold a row to duplicate or delete it"
            onPress={onPressAdd}
          />
        </Section>
      </SafeScrollView>
      <LoadingSpinner isLoading={isLoading} />
      <InputDialog
        isVisible={isDialogVisible}
        title="Add layout"
        description="Enter a layout name"
        onPress={onSubmitName}
        onCancel={onCancelDialog}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isLoading = useSelector(selectLayoutIsLoading)
  const layouts = useSelector(selectLayouts)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Layout' })
  }, [navigation])

  const onPressLayout = useCallback(
    (layout: Layout) => {
      navigation.navigate('LayoutEditor', { layoutId: layout.id })
    },
    [navigation],
  )

  const onLongPressLayout = useCallback(
    async (layout: Layout) => {
      try {
        const action = await AlertAsync(layout.name, 'Choose an action', [
          { text: 'Duplicate', onPress: () => 'duplicate' },
          { text: 'Delete', onPress: () => 'delete', style: 'destructive' },
          { text: MESSAGE.CANCEL, onPress: () => undefined, style: 'cancel' },
        ])

        if (action === 'duplicate') {
          dispatch(duplicateLayout(layout))
          return
        }

        if (action === 'delete') {
          const confirmed = await AlertAsync(
            'Confirm',
            `Delete ${layout.name}?\nPrint data for this layout will also be deleted.`,
            [
              { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
              { text: MESSAGE.YES, onPress: () => true },
            ],
          )
          if (confirmed) {
            dispatch(deleteLayout(layout))
          }
        }
      } catch (e: any) {
        console.warn('onLongPressLayout', e)
        dispatch(enqueueSnackbar({ message: 'Could not complete the action' }))
      }
    },
    [dispatch],
  )

  const onPressAdd = useCallback(() => {
    setIsDialogVisible(true)
  }, [])

  const onSubmitName = useCallback(
    (name: string) => {
      setIsDialogVisible(false)
      dispatch(saveLayout(createLayout(name.trim() || 'New layout')))
    },
    [dispatch],
  )

  const onCancelDialog = useCallback(() => {
    setIsDialogVisible(false)
  }, [])

  return (
    <Component
      {...props}
      {...{
        isLoading,
        layouts,
        isDialogVisible,
        onPressLayout,
        onLongPressLayout,
        onPressAdd,
        onSubmitName,
        onCancelDialog,
      }}
    />
  )
}

export { Container as LayoutList }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
