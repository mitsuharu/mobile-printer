import { all, fork } from 'redux-saga/effects'
import { inAppBrowserSaga } from './modules/inAppWebBrowser/saga'

export function* rootSaga() {
  console.log('rootSaga start')
  yield all([
    fork(inAppBrowserSaga),
  ])
}
