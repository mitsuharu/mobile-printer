import type React from 'react'
import { useCallback, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import Toast, {
  type ToastConfig,
  type ToastConfigParams,
} from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'
import { COLOR } from '@/CONSTANTS'
import { selectSnackbarItem } from '@/redux/modules/snackbar/selectors'
import {
  dequeueSnackbar,
  type SnackbarItem,
} from '@/redux/modules/snackbar/slice'
import { styleType } from '@/utils/styles'

/**
 * SnackBar の表示秒数(ミリ秒)
 */
export const SNACKBAR_DURATION = 2000

/**
 * SnackBar と画面下端の間隔
 *
 * ナビゲーションバーに重ならないよう、実際の間隔は下部のセーフエリアを加算する
 */
const SNACKBAR_BOTTOM_OFFSET = 16

type ComponentProps = {
  message?: string
}

const Component: React.FC<ComponentProps> = ({ message }) => {
  const styles = useStyles()
  return (
    <View accessibilityLiveRegion="polite" style={styles.snackbar}>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const renderSnackbar = ({ text1 }: ToastConfigParams<unknown>) => (
  <Component message={text1} />
)

/**
 * 表示は種類によらず共通のため、すべての type で同じ SnackBar を描画する
 */
const toastConfig: ToastConfig = {
  success: renderSnackbar,
  error: renderSnackbar,
  info: renderSnackbar,
}

/**
 * Redux のキューに積まれた通知を1件ずつ画面下部に表示する
 */
export const GlobalSnackbar: React.FC = () => {
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const item: SnackbarItem | undefined = useSelector(selectSnackbarItem)

  const onDismiss = useCallback(() => {
    if (item) {
      dispatch(dequeueSnackbar({ createdAt: item.createdAt }))
    }
  }, [dispatch, item])

  useEffect(() => {
    if (!item) {
      return
    }
    Toast.show({
      type: item.type,
      text1: item.message,
      position: 'bottom',
      visibilityTime: SNACKBAR_DURATION,
      bottomOffset: SNACKBAR_BOTTOM_OFFSET + insets.bottom,
      onHide: onDismiss,
    })
  }, [item, onDismiss, insets.bottom])

  return <Toast config={toastConfig} />
}

/**
 * 背景と文字は現在の配色を反転させて、画面から浮いて見えるようにする
 */
const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const inverseColorScheme = colorScheme === 'dark' ? 'light' : 'dark'
  const styles = StyleSheet.create({
    snackbar: styleType<ViewStyle>({
      width: '95%',
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderRadius: 8,
      opacity: 0.95,
      backgroundColor: COLOR(inverseColorScheme).BACKGROUND.PRIMARY,
    }),
    message: styleType<TextStyle>({
      fontSize: 14,
      color: COLOR(inverseColorScheme).TEXT.PRIMARY,
    }),
  })
  return styles
})
