import { NavigationContainer } from '@react-navigation/native'
import type React from 'react'
import { StatusBar } from 'react-native'
import { GlobalSnackbar } from '@/components/GlobalSnackbar'
import * as NavigationService from '@/utils/NavigationService'
import type { MainParams } from './main.params'
import { RootRoutes } from './root.routes'
import { useAppTheme } from './theme/useAppTheme'

/**
 * @see https://reactnavigation.org/docs/auth-flow/
 */
const Routes: React.FC = () => {
  const { navigationTheme, statusBarStyle } = useAppTheme()
  return (
    <>
      <StatusBar barStyle={statusBarStyle} />
      <NavigationContainer
        theme={navigationTheme}
        ref={NavigationService.navigationRef}
      >
        <RootRoutes />
      </NavigationContainer>
      <GlobalSnackbar />
    </>
  )
}

export { Routes }

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainParams {}
  }
}
