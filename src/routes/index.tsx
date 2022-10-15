import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { MainParams } from './main.params'
import { RootRoutes } from './root.routes'
import { Provider as PaperProvider } from 'react-native-paper'
import { useAppTheme } from './theme/useAppTheme'
import { GlobalSnackbar } from '@/components/GlobalSnackbar'
import * as NavigationService from '@/utils/NavigationService'

/**
 * @see https://reactnavigation.org/docs/auth-flow/
 * @see https://callstack.github.io/react-native-paper/getting-started.html
 */
const Routes: React.FC = () => {
  const { paperTheme, navigationTheme } = useAppTheme()
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer
        theme={navigationTheme}
        ref={NavigationService.navigationRef}
      >
        <RootRoutes />
      </NavigationContainer>
      <GlobalSnackbar />
    </PaperProvider>
  )
}

export { Routes }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends MainParams {}
  }
}
