import { call, put } from 'redux-saga/effects'
import { printQRCode } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { QRCodeSource } from '../utils'
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer'

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
    SunmiPrinter.lineWrap(1)

    // // 印刷時間
    // SunmiPrinter.lineWrap(2)
    // SunmiPrinter.setAlignment(AlignValue.RIGHT)
    // SunmiPrinter.printerText(`\n${timeStamp()}\n`)
    SunmiPrinter.lineWrap(3)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
