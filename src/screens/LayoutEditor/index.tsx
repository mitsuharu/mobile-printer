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
import ReorderableList, {
  type ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import type { Layout, LayoutElement, LayoutElementType } from '@/print'
import { createLayoutElement } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { describeElementType } from './describeElement'
import { ElementCell } from './ElementCell'
import { ElementTypePickerModal } from './ElementTypePickerModal'

type ParamsProps = RouteProp<MainParams, 'LayoutEditor'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  onReorder: (event: ReorderableListReorderEvent) => void
  onPressElement: (element: LayoutElement) => void
  onPressAdd: () => void
  isPickerVisible: boolean
  onSelectElementType: (type: LayoutElementType) => void
  onCancelPicker: () => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  onReorder,
  onPressElement,
  onPressAdd,
  isPickerVisible,
  onSelectElementType,
  onCancelPicker,
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ReorderableList
        data={layout.elements}
        keyExtractor={(element) => element.id}
        onReorder={onReorder}
        renderItem={({ item }) => (
          <ElementCell
            element={item}
            layout={layout}
            onPress={onPressElement}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Text style={styles.header}>
            要素（右のハンドルをドラッグすると並べ替えできます）
          </Text>
        }
        ListEmptyComponent={<Text style={styles.header}>要素がありません</Text>}
        contentContainerStyle={styles.contentContainer}
      />
      <Section>
        <Cell title="要素を追加する" onPress={onPressAdd} />
      </Section>
      <ElementTypePickerModal
        visible={isPickerVisible}
        onSelect={onSelectElementType}
        onCancel={onCancelPicker}
      />
    </SafeAreaView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    params: { layoutId },
  } = useRoute<ParamsProps>()

  const selector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const layout = useSelector(selector)

  useLayoutEffect(() => {
    navigation.setOptions({ title: layout?.name ?? 'レイアウト' })
  }, [navigation, layout?.name])

  const onReorder = useCallback(
    ({ from, to }: ReorderableListReorderEvent) => {
      if (!layout) {
        return
      }
      dispatch(
        saveLayout({
          ...layout,
          elements: reorderItems(layout.elements, from, to),
        }),
      )
    },
    [dispatch, layout],
  )

  const onPressElement = useCallback(
    async (element: LayoutElement) => {
      if (!layout) {
        return
      }
      try {
        const confirmed = await AlertAsync(
          describeElementType(element.type),
          'この要素を削除しますか？',
          [
            { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
            { text: MESSAGE.YES, onPress: () => true },
          ],
        )
        if (confirmed) {
          dispatch(
            saveLayout({
              ...layout,
              elements: layout.elements.filter(({ id }) => id !== element.id),
            }),
          )
        }
      } catch (e: any) {
        console.warn('onPressElement', e)
      }
    },
    [dispatch, layout],
  )

  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false)

  const onPressAdd = useCallback(() => {
    setIsPickerVisible(true)
  }, [])

  const onCancelPicker = useCallback(() => {
    setIsPickerVisible(false)
  }, [])

  const onSelectElementType = useCallback(
    (type: LayoutElementType) => {
      setIsPickerVisible(false)
      if (!layout) {
        return
      }
      dispatch(
        saveLayout({
          ...layout,
          elements: [...layout.elements, createLayoutElement(type)],
        }),
      )
    },
    [dispatch, layout],
  )

  return (
    <Component
      {...props}
      {...{
        layout,
        onReorder,
        onPressElement,
        onPressAdd,
        isPickerVisible,
        onSelectElementType,
        onCancelPicker,
      }}
    />
  )
}

export { Container as LayoutEditor }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
    }),
    contentContainer: styleType<ViewStyle>({
      paddingBottom: 16,
    }),
    separator: styleType<ViewStyle>({
      height: StyleSheet.hairlineWidth,
      marginLeft: 16,
      backgroundColor: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    header: styleType<TextStyle>({
      paddingHorizontal: 16,
      paddingVertical: 8,
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
