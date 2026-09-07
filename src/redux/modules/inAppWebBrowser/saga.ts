import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import { call, put, takeEvery } from 'redux-saga/effects'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { openWeb } from './slice'

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
