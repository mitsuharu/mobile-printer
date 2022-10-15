// import { COLOR } from '@/CONSTANTS/COLOR'
import { DefaultTheme, DarkTheme } from 'react-native-paper'
import { ColorSchemeName } from 'react-native'

export type Theme = typeof DefaultTheme
type Colors = Pick<Theme, 'colors'>['colors']

const makeColors = (colorScheme: ColorSchemeName): Colors => {
  const themeColors =
    colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors
  return {
    ...themeColors,
    // primary: COLOR(colorScheme).TEXT.SECONDARY,
    // background: COLOR(colorScheme).BACKGROUND.SECONDARY,
    // text: COLOR(colorScheme).TEXT.PRIMARY,
    notification: 'red',
  }
}

export const makeTheme = (colorScheme: ColorSchemeName): Theme => {
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme
  return {
    ...theme,
    colors: {
      ...makeColors(colorScheme),
    },
  }
}
