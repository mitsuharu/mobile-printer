import React from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import { COLOR } from '@/CONSTANTS/COLOR'
import { makeStyles } from 'react-native-swag-styles'
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
