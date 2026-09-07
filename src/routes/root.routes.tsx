import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type React from 'react'
import { MainRoutes } from './main.routes'
import { RootName } from './root.constraint'
import type { RootParams } from './root.params'

const Stack = createNativeStackNavigator<RootParams>()

const Routes: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={RootName.MainRoute}
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name={RootName.MainRoute}
        component={MainRoutes}
        options={{
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  )
}

export { Routes as RootRoutes }
