import { Store } from 'redux'
import { persistStore } from 'redux-persist'
import { rootSaga } from '@/redux/saga'
import { Persistor } from 'redux-persist/es/types'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { snackbarReducer } from './modules/snackbar/slice'
import { userSettingReducer } from './modules/userSetting/slice'
import { printerReducer } from './modules/printer/slice'
import { NFCReducer } from './modules/nfc/slice'
import { AsciiArtReducer } from './modules/asciiArt/slice'

// import createSagaMiddleware from 'redux-saga' で読み込むと
// _reduxSaga.default is not a function (it is undefined) となる
// https://github.com/redux-saga/redux-saga/issues/2705
const createSagaMiddleware = require('redux-saga').default

let store: Store
let persistor: Persistor

export function initializeRedux() {
  console.log(`initializeRedux store: ${!!store}, persistor: ${!!persistor}`)

  if (store == null || persistor == null) {
    const reducer = combineReducers({
      printer: printerReducer,
      snackbar: snackbarReducer,
      userSetting: userSettingReducer,
      nfc: NFCReducer,
      asciiArt: AsciiArtReducer,
    })

    const sagaMiddleware = createSagaMiddleware({
      onError: (error: Error, errorInfo: any) => {
        console.error('sagaMiddleware', error, errorInfo)
      },
    })

    /*
     * Redux-Toolkitで「A non-serializable value was detected」エラーが出たときの対処方法
     * https://zenn.dev/luvmini511/articles/91a76a34909555
     */
    store = configureStore({
      reducer: reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: { ignoredActions: ['persist/PERSIST'] },
        }).concat(sagaMiddleware),
      devTools: true,
    })

    persistor = persistStore(store, null, () => {
      console.log('initializeRedux sagaMiddleware will run')
      sagaMiddleware.run(rootSaga)
      console.log('initializeRedux sagaMiddleware is awaked')
    })
  }
  console.log(`initializeRedux store: ${!!store}, persistor: ${!!persistor}`)

  return { store, persistor }
}
