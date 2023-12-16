import { all, fork } from 'redux-saga/effects'
import { inAppBrowserSaga } from './modules/inAppWebBrowser/saga'
import { printerSaga } from './modules/printer/saga'
import { nfcSaga } from './modules/nfc/saga'
import { asciiArtSaga } from './modules/asciiArt/saga'

export function* rootSaga() {
  console.log('rootSaga start')
  yield all([
    fork(inAppBrowserSaga),
    fork(printerSaga),
    fork(nfcSaga),
    fork(asciiArtSaga),
  ])
}
