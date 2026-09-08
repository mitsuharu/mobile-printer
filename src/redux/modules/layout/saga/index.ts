import { call, put, select, takeEvery, takeLeading } from 'redux-saga/effects'
import {
  deleteLayout as deleteLayoutFromDatabase,
  findAllLayouts,
  getDatabase,
  type SqliteConnection,
  saveLayout as saveLayoutToDatabase,
} from '@/database'
import { duplicateLayout as duplicateLayoutValue, type Layout } from '@/print'
import { reloadPrintDataSaga } from '@/redux/modules/printData/saga'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { selectLayoutById } from '../selectors'
import {
  assignIsLoading,
  assignLayouts,
  deleteLayout,
  duplicateLayout,
  fetchLayouts,
  saveLayout,
} from '../slice'

export function* layoutSaga() {
  yield takeLeading(fetchLayouts, fetchLayoutsSaga)
  yield takeEvery(saveLayout, saveLayoutSaga)
  yield takeEvery(duplicateLayout, duplicateLayoutSaga)
  yield takeEvery(deleteLayout, deleteLayoutSaga)
}

/**
 * SQLite を情報源として、Redux の写しを作り直す
 */
function* reloadLayoutsSaga() {
  const db: SqliteConnection = yield call(getDatabase)
  const layouts: Layout[] = yield call(findAllLayouts, db)
  yield put(assignLayouts(layouts))
}

function* fetchLayoutsSaga() {
  try {
    yield put(assignIsLoading(true))
    yield call(reloadLayoutsSaga)
  } catch (e: any) {
    console.warn('fetchLayoutsSaga', e)
    yield put(
      enqueueSnackbar({ message: `レイアウトの読み込みに失敗しました` }),
    )
  } finally {
    yield put(assignIsLoading(false))
  }
}

function* saveLayoutSaga({ payload }: ReturnType<typeof saveLayout>) {
  try {
    const previous: Layout | undefined = yield select(
      selectLayoutById(payload.id),
    )
    const db: SqliteConnection = yield call(getDatabase)
    yield call(saveLayoutToDatabase, db, payload)
    yield call(reloadLayoutsSaga)

    // 入力項目を消すと、その値は印刷データから連鎖削除される。
    // Redux の写しが古いままだと、消えた値が入力欄に残る。
    const removedField = previous?.fields.some(
      (field) => !payload.fields.some(({ id }) => id === field.id),
    )
    if (removedField) {
      yield call(reloadPrintDataSaga)
    }
  } catch (e: any) {
    console.warn('saveLayoutSaga', e)
    yield put(enqueueSnackbar({ message: `レイアウトの保存に失敗しました` }))
  }
}

function* duplicateLayoutSaga({ payload }: ReturnType<typeof duplicateLayout>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    const copied: Layout = yield call(
      duplicateLayoutValue,
      payload,
      `${payload.name}のコピー`,
    )
    yield call(saveLayoutToDatabase, db, copied)
    yield call(reloadLayoutsSaga)
  } catch (e: any) {
    console.warn('duplicateLayoutSaga', e)
    yield put(enqueueSnackbar({ message: `レイアウトの複製に失敗しました` }))
  }
}

function* deleteLayoutSaga({ payload }: ReturnType<typeof deleteLayout>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(deleteLayoutFromDatabase, db, payload.id)
    yield call(reloadLayoutsSaga)

    // レイアウトを消すと、その印刷データも連鎖削除される。
    // 読み直さないと、消えたはずの印刷データがホームに残る。
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('deleteLayoutSaga', e)
    yield put(enqueueSnackbar({ message: `レイアウトの削除に失敗しました` }))
  }
}
