import { call, put } from 'redux-saga/effects'
import { printText } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { FONT_SIZE, TextSource } from '../utils'
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer'

/**
 * @package
 */
export function* printTextSaga({ payload }: ReturnType<typeof printText>) {
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

async function print({ text, size }: TextSource) {
  const fontSize = size === 'default' ? FONT_SIZE.DEFAULT : FONT_SIZE.LARGE

  try {
    SunmiPrinter.setAlignment(AlignValue.CENTER)
    SunmiPrinter.setFontSize(fontSize)
    SunmiPrinter.setFontWeight(true)

    SunmiPrinter.lineWrap(1)
    SunmiPrinter.printerText(`${text}\n`)

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
