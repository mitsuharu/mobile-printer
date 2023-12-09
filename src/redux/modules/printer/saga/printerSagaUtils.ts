import { put, select } from 'redux-saga/effects'
import { selectIsPrintable } from '../selectors'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'

/**
 * @package
 */
export function* validatePrinterSaga() {
  try {
    const isPrintable: boolean = yield select(selectIsPrintable)
    if (!isPrintable) {
      yield put(
        enqueueSnackbar({
          message: `印刷に失敗しました。プリンターが搭載されていない、もしくはプリンターに接続できていません。`,
        }),
      )
    }
    return isPrintable
  } catch (error: any) {
    console.warn('validatePrinter', error)
    return false
  }
}
