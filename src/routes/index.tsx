import { NavigationContainer } from '@react-navigation/native'
import type React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { GlobalSnackbar } from '@/components/GlobalSnackbar'
import * as NavigationService from '@/utils/NavigationService'
import type { MainParams } from './main.params'
import { RootRoutes } from './root.routes'
import { useAppTheme } from './theme/useAppTheme'

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
  namespace ReactNavigation {
    interface RootParamList extends MainParams {}
  }
}
