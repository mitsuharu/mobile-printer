import { call, put, takeEvery } from 'redux-saga/effects'
import { openWeb } from './slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'

export function* inAppBrowserSaga() {
  yield takeEvery(openWeb, openWebSaga)
}

function* openWebSaga({ payload }: ReturnType<typeof openWeb>) {
  try {
    yield call(InAppBrowser.open, payload)
  } catch (e: any) {
    console.warn('openWebSaga', e)
    yield put(
      enqueueSnackbar({
        message: `web browser を開くのを失敗しまた`,
      }),
    )
  }
}
