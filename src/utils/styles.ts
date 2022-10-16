import { ViewStyle, TextStyle, ImageStyle } from 'react-native'

/**
 * StyleSheet.create において、個々のスタイルを型安全にする関数
 *
 * @example
 * const styles = StyleSheet.create({
 *   container: styleType<ViewStyle>({
 *     flex: 1,
 *     alignItems: 'center',
 *     justifyContent: 'center',
 *   }),
 *   text: styleType<TextStyle>({
 *     textAlign: 'center',
 *   }),
 * })
 */
export const styleType = <T extends ViewStyle | TextStyle | ImageStyle>(
  style: T,
): T => style
