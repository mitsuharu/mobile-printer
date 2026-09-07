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
import ReorderableList, {
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { COLOR } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import type { Layout, LayoutElement, LayoutElementType } from '@/print'
import { addElement, createLayoutElement, moveElement } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
import { printLayout } from '@/redux/modules/printData/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { ElementCell } from './ElementCell'
import { ElementTypePickerModal } from './ElementTypePickerModal'

type ParamsProps = RouteProp<MainParams, 'LayoutEditor'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  onReorder: (event: ReorderableListReorderEvent) => void
  onPressElement: (element: LayoutElement) => void
  onPressAdd: () => void
  onPressFields: () => void
  onPressPreview: () => void
  onPressPrintData: () => void
  onPressPrint: () => void
  isPickerVisible: boolean
  onSelectElementType: (type: LayoutElementType) => void
  onCancelPicker: () => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  onReorder,
  onPressElement,
  onPressAdd,
  onPressFields,
  onPressPreview,
  onPressPrintData,
  onPressPrint,
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
        <Cell
          title="入力項目"
          description={`${layout.fields.length}個`}
          onPress={onPressFields}
          accessory="disclosure"
        />
        <Cell
          title="このレイアウトで印刷する"
          description="入力項目は空のまま印刷します"
          onPress={onPressPrint}
        />
        <Cell
          title="印刷イメージを見る"
          onPress={onPressPreview}
          accessory="disclosure"
        />
        <Cell
          title="印刷データ"
          onPress={onPressPrintData}
          accessory="disclosure"
        />
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
      dispatch(saveLayout(moveElement(layout, from, to)))
    },
    [dispatch, layout],
  )

  const onPressElement = useCallback(
    (element: LayoutElement) => {
      navigation.navigate('ElementEditor', {
        layoutId,
        elementId: element.id,
      })
    },
    [navigation, layoutId],
  )

  const onPressFields = useCallback(() => {
    navigation.navigate('LayoutFields', { layoutId })
  }, [navigation, layoutId])

  const onPressPreview = useCallback(() => {
    navigation.navigate('LayoutPreview', { layoutId })
  }, [navigation, layoutId])

  const onPressPrintData = useCallback(() => {
    navigation.navigate('PrintDataList', { layoutId })
  }, [navigation, layoutId])

  const onPressPrint = useCallback(() => {
    dispatch(printLayout({ layoutId }))
  }, [dispatch, layoutId])

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
      dispatch(saveLayout(addElement(layout, createLayoutElement(type))))
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
        onPressFields,
        onPressPreview,
        onPressPrintData,
        onPressPrint,
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
