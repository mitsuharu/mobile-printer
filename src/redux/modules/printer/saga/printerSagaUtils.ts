import { call, put, select } from 'redux-saga/effects'
import { selectIsPrintable } from '../selectors'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import {
  PrinterInfo,
  getPrinterInfo,
} from '@mitsuharu/react-native-sunmi-printer-library'
import { assignPrinterInfo } from '../slice'

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

/**
 * @package
 */
export function* getPrinterInfoSaga() {
  try {
    const printerInfo: PrinterInfo = yield call(getPrinterInfo)
    yield put(assignPrinterInfo(printerInfo))
  } catch (error: any) {
    console.warn('getPrinterInfoSaga', error)
  }
}
