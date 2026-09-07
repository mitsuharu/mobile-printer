import type React from 'react'
import {
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styleType } from '@/utils/styles'

/**
 * 端末のナビゲーションバーの上までで描画を止める ScrollView
 *
 * @note
 * 下端に余白を足すだけでは、スクロール中の内容がナビゲーションバーの下を
 * 通り抜けて重なって見える。表示領域そのものを狭めて重ならないようにする。
 */
export const SafeScrollView: React.FC<ScrollViewProps> = ({
  style,
  ...props
}) => {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['bottom']}>
      <ScrollView {...props} style={styles.scrollView} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: styleType<ViewStyle>({
    flex: 1,
  }),
  scrollView: styleType<ViewStyle>({
    flex: 1,
  }),
})
