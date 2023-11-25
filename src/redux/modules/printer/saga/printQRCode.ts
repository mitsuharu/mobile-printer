import { call, put, takeLeading } from 'redux-saga/effects'
import { printQRCode } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { QRCodeSource } from '../utils'
import SunmiPrinter, {
  AlignValue,
  SunmiScan,
} from '@heasy/react-native-sunmi-printer'
import { eventChannel } from 'redux-saga'
import { DeviceEventEmitter } from 'react-native'

/**
 * @package
 */
export function* printQRCodeSaga({ payload }: ReturnType<typeof printQRCode>) {
  try {
    const hasPrinter: boolean = yield call(SunmiPrinter.hasPrinter)
    if (!hasPrinter) {
      yield put(
        enqueueSnackbar({
          message: `ご利用の端末にプリンターがありません。`,
        }),
      )
      return
    }

    yield call(print, payload)
  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷に失敗しました`,
      }),
    )
  }
}

async function print({ text }: QRCodeSource) {
  try {
    SunmiPrinter.setAlignment(AlignValue.CENTER)
    SunmiPrinter.setFontWeight(true)

    SunmiPrinter.lineWrap(1)
    SunmiPrinter.printQRCode(text, 8, 1)
    SunmiPrinter.lineWrap(5)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}

/**
 * @package
 */
export function* duplicateQRCodeSaga() {
  try {
    yield call(SunmiScan.scan)
  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷に失敗しました`,
      }),
    )
  }
}

/**
 * @package
 */
export function* monitorScanSuccessSaga() {
  // https://github.com/Surile/react-native-sunmi-printer#broadcast-event-listener
  const onScanSuccessChannel = eventChannel(
    (emitter: (message: string) => void) => {
      DeviceEventEmitter.addListener('onScanSuccess', emitter)
      return () => DeviceEventEmitter.removeAllListeners('onScanSuccess')
    },
  )
  yield takeLeading(onScanSuccessChannel, scanSuccessSaga)
}

function* scanSuccessSaga(message: string) {
  yield put(printQRCode({ text: message }))
}
