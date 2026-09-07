import { call, put, takeEvery, takeLeading } from 'redux-saga/effects'
import {
  deleteLayout as deleteLayoutFromDatabase,
  findAllLayouts,
  getDatabase,
  type SqliteConnection,
  saveLayout as saveLayoutToDatabase,
} from '@/database'
import { duplicateLayout as duplicateLayoutValue, type Layout } from '@/print'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
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
    const db: SqliteConnection = yield call(getDatabase)
    yield call(saveLayoutToDatabase, db, payload)
    yield call(reloadLayoutsSaga)
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
  } catch (e: any) {
    console.warn('deleteLayoutSaga', e)
    yield put(enqueueSnackbar({ message: `レイアウトの削除に失敗しました` }))
  }
}
