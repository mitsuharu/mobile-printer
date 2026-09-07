import type React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { useReorderableDrag } from 'react-native-reorderable-list'
import { makeStyles } from 'react-native-swag-styles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { COLOR } from '@/CONSTANTS'
import { Button } from '@/components/Button'
import type { Layout, LayoutElement } from '@/print'
import { styleType } from '@/utils/styles'
import { describeElement, describeElementType } from './describeElement'

type Props = {
  element: LayoutElement
  layout: Layout
  onPress: (element: LayoutElement) => void
}

/**
 * 並べ替えできる要素のセル
 *
 * @note
 * ハンドルは触れた時点でドラッグを始める。長押しを待たせると、掴めたのか
 * どうかが分かりにくいうえ、押したまま指を動かす操作と相性が悪い。
 */
export const ElementCell: React.FC<Props> = ({ element, layout, onPress }) => {
  const styles = useStyles()
  const drag = useReorderableDrag()

  return (
    <View style={styles.container}>
      <Button style={styles.content} onPress={() => onPress(element)}>
        <Text style={styles.type}>{describeElementType(element.type)}</Text>
        <Text style={styles.summary} numberOfLines={1}>
          {describeElement(element, layout)}
        </Text>
      </Button>
      <Pressable
        style={styles.handle}
        onPressIn={drag}
        accessibilityLabel="並べ替え"
        accessibilityRole="button"
      >
        <Icon name="drag-handle" size={24} style={styles.handleIcon} />
      </Pressable>
    </View>
  )
}

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      paddingLeft: 16,
      paddingRight: 8,
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    }),
    content: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 8,
    }),
    type: styleType<TextStyle>({
      fontSize: 12,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    summary: styleType<TextStyle>({
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    handle: styleType<ViewStyle>({
      paddingHorizontal: 12,
      paddingVertical: 12,
    }),
    handleIcon: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
  })
  return styles
})
