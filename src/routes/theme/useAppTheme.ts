import type { Theme as NavigationTheme } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { makeTheme as makeNavigationTheme } from './navigationTheme'
import { makeStatusBarStyle } from './statusBarStyle'

export const useAppTheme = () => {
  const colorScheme = useColorScheme()
  const [navigationTheme, setNavigationTheme] = useState<NavigationTheme>(
    makeNavigationTheme(colorScheme),
  )

  useEffect(() => {
    setNavigationTheme(makeNavigationTheme(colorScheme))
  }, [colorScheme])

  return { navigationTheme, statusBarStyle: makeStatusBarStyle(colorScheme) }
}
