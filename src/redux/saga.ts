import { all, fork } from 'redux-saga/effects'
import { asciiArtSaga } from './modules/asciiArt/saga'
import { databaseSaga } from './modules/database/saga'
import { inAppBrowserSaga } from './modules/inAppWebBrowser/saga'
import { layoutSaga } from './modules/layout/saga'
import { nfcSaga } from './modules/nfc/saga'
import { printDataSaga } from './modules/printData/saga'
import { printerSaga } from './modules/printer/saga'

export function* rootSaga() {
  console.log('rootSaga start')
  yield all([
    fork(databaseSaga),
    fork(layoutSaga),
    fork(printDataSaga),
    fork(inAppBrowserSaga),
    fork(printerSaga),
    fork(nfcSaga),
    fork(asciiArtSaga),
  ])
}
