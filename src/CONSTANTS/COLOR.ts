import { ColorSchemeName } from 'react-native'

type ColorType = {
  CLEAR: string
  TEXT: {
    PRIMARY: string
    SECONDARY: string
  }
  BACKGROUND: {
    PRIMARY: string
    SECONDARY: string
  }
}

const defaultColor: ColorType = {
  CLEAR: 'rgba(0,0,0,0)',
  TEXT: {
    PRIMARY: 'black',
    SECONDARY: '#4F5A6B',
  },
  BACKGROUND: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#F2F2F2',
  },
}

const darkColor: ColorType = {
  ...defaultColor,
  TEXT: {
    PRIMARY: 'white',
    SECONDARY: '#E2E8F1',
  },
  BACKGROUND: {
    PRIMARY: '#171F2A',
    SECONDARY: '#11161D',
  },
}

export const COLOR = (colorScheme: ColorSchemeName = 'light') => {
  return colorScheme === 'dark' ? darkColor : defaultColor
}
