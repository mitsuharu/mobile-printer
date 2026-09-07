import type React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate as PersistProvider } from 'redux-persist/integration/react'
import { initializeRedux } from '@/redux'
import { Routes } from '@/routes'
import { NfcModel } from './components/Modal/NfcModal'

const App: React.FC = () => {
  const { persistor, store } = initializeRedux()

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PersistProvider loading={false} persistor={persistor}>
          <Routes />
          <NfcModel />
        </PersistProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  )
}

export default App
