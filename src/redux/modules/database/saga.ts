import { call, put } from 'redux-saga/effects'
import {
  type InitializeDatabaseResult,
  initializeDatabase,
  seedPresets,
} from '@/database'
import { fetchLayouts } from '@/redux/modules/layout/slice'
import { fetchPrintData } from '@/redux/modules/printData/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { assignIsReady } from './slice'

export function* databaseSaga() {
  try {
    const { connection, isCreated }: InitializeDatabaseResult =
      yield call(initializeDatabase)
    if (isCreated) {
      yield call(seedPresets, connection)
    }
    yield put(assignIsReady(true))

    // 書き込みのたびに写しを作り直しているため、読み込みは起動時の一度で足りる
    yield put(fetchLayouts())
    yield put(fetchPrintData())
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
