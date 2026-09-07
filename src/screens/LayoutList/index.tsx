import { useIsFocused, useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import type { Layout } from '@/print'
import { createLayout } from '@/print'
import { selectDatabaseIsReady } from '@/redux/modules/database/selectors'
import { selectLayouts } from '@/redux/modules/layout/selectors'
import {
  deleteLayout,
  duplicateLayout,
  fetchLayouts,
  saveLayout,
} from '@/redux/modules/layout/slice'
import { formatDateTime } from '@/utils/day'
import { styleType } from '@/utils/styles'

type Props = {}
type ComponentProps = Props & {
  layouts: Layout[]
  isDialogVisible: boolean
  onPressLayout: (layout: Layout) => void
  onLongPressLayout: (layout: Layout) => void
  onPressAdd: () => void
  onSubmitName: (name: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
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
        <Section title="レイアウト">
          {layouts.length === 0 ? (
            <Cell
              title="レイアウトがありません"
              description="下の「レイアウトを追加する」から作成してください"
              inactive={true}
            />
          ) : (
            layouts.map((layout) => (
              <Cell
                key={layout.id}
                title={layout.name}
                description={`要素${layout.elements.length}個・${formatDateTime(layout.updatedAt)}`}
                accessory="disclosure"
                onPress={() => onPressLayout(layout)}
                onLongPress={() => onLongPressLayout(layout)}
              />
            ))
          )}
        </Section>
        <Section title="操作">
          <Cell
            title="レイアウトを追加する"
            description="セルを長押しすると複製と削除ができます"
            onPress={onPressAdd}
          />
        </Section>
      </SafeScrollView>
      <InputDialog
        isVisible={isDialogVisible}
        title="レイアウトの追加"
        description="レイアウトの名前を入力してください"
        onPress={onSubmitName}
        onCancel={onCancelDialog}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const isFocused = useIsFocused()

  const layouts = useSelector(selectLayouts)
  const isDatabaseReady = useSelector(selectDatabaseIsReady)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'レイアウト' })
  }, [navigation])

  // SQLite が情報源なので、表示するたびに読み直す
  useEffect(() => {
    if (isFocused && isDatabaseReady) {
      dispatch(fetchLayouts())
    }
  }, [dispatch, isFocused, isDatabaseReady])

  const onPressLayout = useCallback(
    (layout: Layout) => {
      navigation.navigate('LayoutEditor', { layoutId: layout.id })
    },
    [navigation],
  )

  const onLongPressLayout = useCallback(
    async (layout: Layout) => {
      try {
        const action = await AlertAsync(layout.name, '操作を選んでください', [
          { text: '複製する', onPress: () => 'duplicate' },
          { text: '削除する', onPress: () => 'delete', style: 'destructive' },
          { text: MESSAGE.CANCEL, onPress: () => undefined, style: 'cancel' },
        ])

        if (action === 'duplicate') {
          dispatch(duplicateLayout(layout))
          return
        }

        if (action === 'delete') {
          const confirmed = await AlertAsync(
            '確認',
            `「${layout.name}」を削除しますか？\nこのレイアウトの印刷データも消えます。`,
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
      dispatch(saveLayout(createLayout(name.trim() || '新しいレイアウト')))
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
