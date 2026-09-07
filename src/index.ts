import { AppRegistry } from 'react-native'
import { name as appName } from '../app.json'
import App from './App'
import '@/utils/dayjsPlugins'

AppRegistry.registerComponent(appName, () => App)
