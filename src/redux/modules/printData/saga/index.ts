import { call, put, takeEvery, takeLeading } from 'redux-saga/effects'
import {
  deletePrintData as deletePrintDataFromDatabase,
  findAllPrintData,
  getDatabase,
  type SqliteConnection,
  savePrintData as savePrintDataToDatabase,
} from '@/database'
import type { PrintData } from '@/print'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { createUUID } from '@/utils/uuid'
import {
  assignIsLoading,
  assignPrintData,
  deletePrintData,
  duplicatePrintData,
  fetchPrintData,
  savePrintData,
} from '../slice'

export function* printDataSaga() {
  yield takeLeading(fetchPrintData, fetchPrintDataSaga)
  yield takeEvery(savePrintData, savePrintDataSaga)
  yield takeEvery(duplicatePrintData, duplicatePrintDataSaga)
  yield takeEvery(deletePrintData, deletePrintDataSaga)
}

/**
 * SQLite を情報源として、Redux の写しを作り直す
 */
function* reloadPrintDataSaga() {
  const db: SqliteConnection = yield call(getDatabase)
  const values: PrintData[] = yield call(findAllPrintData, db)
  yield put(assignPrintData(values))
}

function* fetchPrintDataSaga() {
  try {
    yield put(assignIsLoading(true))
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('fetchPrintDataSaga', e)
    yield put(
      enqueueSnackbar({ message: `印刷データの読み込みに失敗しました` }),
    )
  } finally {
    yield put(assignIsLoading(false))
  }
}

function* savePrintDataSaga({ payload }: ReturnType<typeof savePrintData>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(savePrintDataToDatabase, db, payload)
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('savePrintDataSaga', e)
    yield put(enqueueSnackbar({ message: `印刷データの保存に失敗しました` }))
  }
}

function* duplicatePrintDataSaga({
  payload,
}: ReturnType<typeof duplicatePrintData>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(savePrintDataToDatabase, db, {
      ...payload,
      id: createUUID(),
      title: `${payload.title}のコピー`,
    })
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('duplicatePrintDataSaga', e)
    yield put(enqueueSnackbar({ message: `印刷データの複製に失敗しました` }))
  }
}

function* deletePrintDataSaga({ payload }: ReturnType<typeof deletePrintData>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(deletePrintDataFromDatabase, db, payload.id)
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('deletePrintDataSaga', e)
    yield put(enqueueSnackbar({ message: `印刷データの削除に失敗しました` }))
  }
}
