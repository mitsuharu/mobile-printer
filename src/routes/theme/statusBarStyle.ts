import type { ColorSchemeName, StatusBarStyle } from 'react-native'

/**
 * ステータスバーの文字と絵柄の色を決める
 *
 * @note
 * 端末の画面いっぱいに描く設定（`edgeToEdgeEnabled`）のため、ステータスバーの
 * 裏にはアプリの背景がそのまま出る。背景に合う色を指定しないと、明るい背景に
 * 白い時計が重なって読めなくなる。
 */
export const makeStatusBarStyle = (
  colorScheme: ColorSchemeName | null,
): StatusBarStyle => (colorScheme === 'dark' ? 'light-content' : 'dark-content')
