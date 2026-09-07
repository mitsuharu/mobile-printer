import { all, fork } from 'redux-saga/effects'
import { asciiArtSaga } from './modules/asciiArt/saga'
import { inAppBrowserSaga } from './modules/inAppWebBrowser/saga'
import { nfcSaga } from './modules/nfc/saga'
import { printerSaga } from './modules/printer/saga'

export function* rootSaga() {
  console.log('rootSaga start')
  yield all([
    fork(inAppBrowserSaga),
    fork(printerSaga),
    fork(nfcSaga),
    fork(asciiArtSaga),
  ])
}
