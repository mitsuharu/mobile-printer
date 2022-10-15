

import React from 'react'
// import Routes from '@/routes'
import { PersistGate as PersistProvider } from 'redux-persist/integration/react'
import { Provider as ReduxProvider } from 'react-redux'
import { initializeRedux } from '@/redux'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Home } from './screens/Home'

const App: React.FC = () => {
  const { persistor, store } = initializeRedux()
  

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PersistProvider loading={false} persistor={persistor}>
          {/* <Routes /> */}
          <Home />
        </PersistProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  )
}

export default App

