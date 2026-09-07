import type React from 'react'
import {
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR } from '@/CONSTANTS'
import { styleType } from '@/utils/styles'

type Props = { title?: string; style?: StyleProp<ViewStyle> }

const Component: React.FC<Props> = ({ title, style }) => {
  const styles = useStyles()
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{title}</Text>
    </View>
  )
}

const Container: React.FC<Props> = (props) => <Component {...props} />

export { Container as SectionHeader }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      backgroundColor: COLOR(colorScheme).BACKGROUND.SECONDARY,
      paddingVertical: 8,
      paddingHorizontal: 16,
    }),
    text: styleType<TextStyle>({
      fontWeight: '500',
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
  })
  return styles
})
