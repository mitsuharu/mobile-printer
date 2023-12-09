import { call, put } from 'redux-saga/effects'
import { printText } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { FONT_SIZE, TextSource } from '../utils'
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { validatePrinterSaga } from './printerSagaUtils'

/**
 * @package
 */
export function* printTextSaga({ payload }: ReturnType<typeof printText>) {
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

async function print({ text, size }: TextSource) {
  const fontSize = size === 'default' ? FONT_SIZE.DEFAULT : FONT_SIZE.LARGE

  try {
    SunmiPrinterLibrary.setAlignment('center')
    SunmiPrinterLibrary.setFontSize(fontSize)
    SunmiPrinterLibrary.setTextStyle('bold', true)

    SunmiPrinterLibrary.lineWrap(1)
    SunmiPrinterLibrary.printText(text)
    SunmiPrinterLibrary.lineWrap(5)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
