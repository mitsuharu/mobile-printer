import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type React from 'react'
import { AppInfo } from '@/screens/AppInfo'
import { ElementEditor } from '@/screens/ElementEditor'
import { Home } from '@/screens/Home'
import { LayoutEditor } from '@/screens/LayoutEditor'
import { LayoutFields } from '@/screens/LayoutFields'
import { LayoutList } from '@/screens/LayoutList'
import { LayoutPreview } from '@/screens/LayoutPreview'
import { LicenseDetail } from '@/screens/LicenseDetail'
import { Licenses } from '@/screens/Licenses'
import { PrintDataForm } from '@/screens/PrintDataForm'
import { PrintDataList } from '@/screens/PrintDataList'
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
      <Stack.Screen name={MainName.Printer} component={Printer} />
      <Stack.Screen name={MainName.LayoutList} component={LayoutList} />
      <Stack.Screen name={MainName.LayoutEditor} component={LayoutEditor} />
      <Stack.Screen name={MainName.ElementEditor} component={ElementEditor} />
      <Stack.Screen name={MainName.LayoutFields} component={LayoutFields} />
      <Stack.Screen name={MainName.LayoutPreview} component={LayoutPreview} />
      <Stack.Screen name={MainName.PrintDataList} component={PrintDataList} />
      <Stack.Screen name={MainName.PrintDataForm} component={PrintDataForm} />
      <Stack.Screen name={MainName.AppInfo} component={AppInfo} />
      <Stack.Screen name={MainName.Licenses} component={Licenses} />
      <Stack.Screen name={MainName.LicenseDetail} component={LicenseDetail} />
    </Stack.Navigator>
  )
}

export { Routes as MainRoutes }
