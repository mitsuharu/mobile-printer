import { styleType } from '@/utils/styles'
import React, { ReactNode } from 'react'
import {
  Pressable,
  Text,
  ViewStyle,
  StyleSheet,
  TextStyle,
  Insets,
  StyleProp,
} from 'react-native'

type ContentProps = {
  text?: string
  textStyle?: StyleProp<TextStyle>
  children?: ReactNode
}
type Props = ContentProps & {
  onPress?: () => void
  onLongPress?: () => void
  style?: StyleProp<ViewStyle>
  inactive?: boolean
  accessibilityLabel?: string
  hitSlop?: Insets
}
type ComponentProps = Props & {}

const Component: React.FC<ComponentProps> = ({
  text,
  children,
  onPress,
  onLongPress,
  style,
  textStyle,
  inactive,
  accessibilityLabel,
  hitSlop,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        style,
        !!onPress && pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
      onPress={() => !inactive && onPress?.()}
      onLongPress={() => !inactive && onLongPress?.()}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={hitSlop}
    >
      {!!text && <Text style={textStyle}>{text}</Text>}
      {!!children && children}
    </Pressable>
  )
}

/**
 * 弊アプリで使用する基本ボタン
 *
 * - ボタンやテキストの色や配置なので基本styleを導入済み
 * - タップ時および非活性時の透明化を対応済み
 * - 追加styleやchildrenでカスタマイズできる
 */
const Container: React.FC<Props> = (props) => {
  return <Component {...props} />
}

export { Container as Button }

const styles = StyleSheet.create({
  container: styleType<ViewStyle>({
    opacity: 1.0,
  }),
  pressed: styleType<ViewStyle>({
    opacity: 0.7,
  }),
  inactive: styleType<ViewStyle>({
    opacity: 0.3,
  }),
})
