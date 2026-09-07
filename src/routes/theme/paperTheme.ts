import type { ColorSchemeName } from 'react-native'
import { DefaultTheme, MD3DarkTheme } from 'react-native-paper'
import { COLOR } from '@/CONSTANTS'

export type Theme = typeof DefaultTheme
type Colors = Pick<Theme, 'colors'>['colors']

// なぜか切り出さないで使うと `TypeError: Cannot read property 'colors' of undefined`
const getThemeColors = (colorScheme: ColorSchemeName | null): Colors =>
  colorScheme === 'dark' ? MD3DarkTheme.colors : DefaultTheme.colors

const makeColors = (colorScheme: ColorSchemeName | null): Colors => {
  const themeColors = getThemeColors(colorScheme)
  return {
    ...themeColors,
    primary: COLOR(colorScheme).TEXT.SECONDARY,
    background: COLOR(colorScheme).BACKGROUND.SECONDARY,
  }
}

export const makeTheme = (colorScheme: ColorSchemeName | null): Theme => {
  const theme = colorScheme === 'dark' ? MD3DarkTheme : DefaultTheme
  return {
    ...theme,
    colors: {
      ...makeColors(colorScheme),
    },
  }
}
