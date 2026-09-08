import type React from 'react'
import {
  Pressable,
  StyleSheet,
  type TextStyle,
  useColorScheme,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { COLOR } from '@/CONSTANTS'
import { styleType } from '@/utils/styles'

type Props = {
  onPress: () => void
}

/**
 * ナビゲーションバー右上に置く、アプリ情報を開くボタン
 */
export const AppInfoButton: React.FC<Props> = ({ onPress }) => {
  const styles = useStyles()

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityLabel="このアプリについて"
      accessibilityRole="button"
      hitSlop={8}
    >
      <Icon name="info-outline" size={22} style={styles.icon} />
    </Pressable>
  )
}

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      paddingLeft: 12,
      justifyContent: 'center',
    }),
    icon: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
  })
  return styles
})
