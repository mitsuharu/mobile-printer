import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainParams } from './main.params'
import { MainName } from './main.constraint'
import { Home } from '@/screens/Home'


const Stack = createNativeStackNavigator<MainParams>()

const Routes: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={MainName.Home}
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name={MainName.Home} component={Home} />
    </Stack.Navigator>
  )
}

export { Routes as MainRoutes }
