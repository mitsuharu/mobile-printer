import { call, put, takeLeading } from 'redux-saga/effects'
import { printQRCode } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { QRCodeSource } from '../utils'
import { eventChannel } from 'redux-saga'
import { DeviceEventEmitter } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { MESSAGE } from '@/CONSTANTS/MESSAGE'
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { validatePrinterSaga } from './printerSagaUtils'

/**
 * @package
 */
export function* printQRCodeSaga({ payload }: ReturnType<typeof printQRCode>) {
  try {
    const isPrintable: boolean = yield call(validatePrinterSaga)
    if (!isPrintable) {
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
    SunmiPrinterLibrary.setAlignment('center')
    SunmiPrinterLibrary.setTextStyle('bold', true)

    SunmiPrinterLibrary.lineWrap(1)
    SunmiPrinterLibrary.printQRCode(text, 8, 'low')
    SunmiPrinterLibrary.lineWrap(5)
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
    yield call(SunmiPrinterLibrary.scan)
  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `キャンセル、もしくはお使いの端末はスキャン機能がご利用できません`,
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
  const result: boolean = yield call(
    AlertAsync,
    'QR複製の確認',
    `「${message}」の内容で複製しますか？`,
    [
      { text: MESSAGE.NO, onPress: () => false },
      { text: MESSAGE.YES, onPress: () => true },
    ],
  )
  if (result) {
    yield put(printQRCode({ text: message }))
  }
}
