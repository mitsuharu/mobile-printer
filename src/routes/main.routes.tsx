import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type React from 'react'
import { Form } from '@/screens/Form'
import { Home } from '@/screens/Home'
import { LayoutList } from '@/screens/LayoutList'
import { Printer } from '@/screens/Printer'
import { MainName } from './main.constraint'
import type { MainParams } from './main.params'

const Stack = createNativeStackNavigator<MainParams>()

const Routes: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={MainName.Home}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name={MainName.Home} component={Home} />
      <Stack.Screen name={MainName.Form} component={Form} />
      <Stack.Screen name={MainName.Printer} component={Printer} />
      <Stack.Screen name={MainName.LayoutList} component={LayoutList} />
    </Stack.Navigator>
  )
}

export { Routes as MainRoutes }
