import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainRoutes } from './main.routes'
import { RootParams } from './root.params'
import { RootName } from './root.constraint'

const Stack = createNativeStackNavigator<RootParams>()

const Routes: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={RootName.MainRoute}
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
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
