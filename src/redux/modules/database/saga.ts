import { call, put } from 'redux-saga/effects'
import { initializeDatabase } from '@/database'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { assignIsReady } from './slice'

export function* databaseSaga() {
  try {
    yield call(initializeDatabase)
    yield put(assignIsReady(true))
  } catch (e: any) {
    console.warn('databaseSaga', e)
    yield put(assignIsReady(false))
    yield put(
      enqueueSnackbar({
        message: `データの読み込みに失敗しました`,
      }),
    )
  }
}
