import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native'
import { ColorSchemeName } from 'react-native'

type Colors = Pick<Theme, 'colors'>['colors']

const makeColors = (colorScheme: ColorSchemeName): Colors => {
  const themeColors =
    colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors
  return {
    ...themeColors,
    // primary: COLOR(colorScheme).TEXT.SECONDARY,
    // background: COLOR(colorScheme).BACKGROUND.SECONDARY,
    // card: COLOR(colorScheme).BACKGROUND.SECONDARY,
    // text: COLOR(colorScheme).TEXT.PRIMARY,
    // border: COLOR(colorScheme).BACKGROUND.PRIMARY,
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
