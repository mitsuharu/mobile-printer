import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Theme as NavigationTheme } from '@react-navigation/native'
import { makeTheme as makeNavigationTheme } from './navigationTheme'
import { makeTheme as makePaperTheme, Theme as PaperTheme } from './paperTheme'

export const useAppTheme = () => {
  const colorScheme = useColorScheme()
  const [navigationTheme, setNavigationTheme] = useState<NavigationTheme>(
    makeNavigationTheme(colorScheme),
  )
  const [paperTheme, setPaperTheme] = useState<PaperTheme>(
    makePaperTheme(colorScheme),
  )

  useEffect(() => {
    setNavigationTheme(makeNavigationTheme(colorScheme))
    setPaperTheme(makePaperTheme(colorScheme))
  }, [colorScheme])

  return { navigationTheme, paperTheme }
}
