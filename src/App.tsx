import type React from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate as PersistProvider } from 'redux-persist/integration/react'
import { initializeRedux } from '@/redux'
import { Routes } from '@/routes'
import { styleType } from '@/utils/styles'
import { NfcModel } from './components/Modal/NfcModal'

const App: React.FC = () => {
  const { persistor, store } = initializeRedux()

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PersistProvider loading={false} persistor={persistor}>
            <Routes />
            <NfcModel />
          </PersistProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: styleType<ViewStyle>({
    flex: 1,
  }),
})

export default App
