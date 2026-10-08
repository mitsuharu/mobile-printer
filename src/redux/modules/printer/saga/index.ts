import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { Platform } from 'react-native'
import { getBrand, isEmulator } from 'react-native-device-info'
import { call, fork, put, takeEvery } from 'redux-saga/effects'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import {
  assignIsPrintable,
  duplicateQRCode,
  printImage,
  printImageFromImagePicker,
  printQRCode,
  printText,
} from '../slice'
import { getPrinterInfoSaga } from './printerSagaUtils'
import { printImageFromImagePickerSaga, printImageSaga } from './printImage'
import {
  duplicateQRCodeSaga,
  monitorScanSuccessSaga,
  printQRCodeSaga,
} from './printQRCode'
import { printTextSaga } from './printText'

export function* printerSaga() {
  if (Platform.OS !== 'android') {
    console.warn(`printerSaga, It supports only Android.`)
    // Android のみ対応する
    return
  }

  yield fork(printInitSaga)
  yield fork(monitorScanSuccessSaga)
  yield takeEvery(printText, printTextSaga)
  yield takeEvery(printImage, printImageSaga)
  yield takeEvery(printImageFromImagePicker, printImageFromImagePickerSaga)
  yield takeEvery(printQRCode, printQRCodeSaga)
  yield takeEvery(duplicateQRCode, duplicateQRCodeSaga)
}

function* printInitSaga() {
  try {
    const isSimulator: boolean = yield call(isEmulator)
    if (isSimulator) {
      yield put(
        enqueueSnackbar({
          message: 'Printing is unavailable in an emulator',
        }),
      )
      return
    }

    const brand: string = yield call(getBrand)
    if (!brand.toLocaleLowerCase().includes('sunmi')) {
      yield put(
        enqueueSnackbar({
          message: 'Use a SUNMI device',
        }),
      )
      return
    }

    yield call(SunmiPrinterLibrary.prepare)
    yield put(assignIsPrintable(true))
    yield fork(getPrinterInfoSaga)
  } catch (e: any) {
    console.warn('printInitSaga', e)
    yield put(assignIsPrintable(false))
    yield put(
      enqueueSnackbar({
        message: 'Could not connect to the printer',
      }),
    )
  }
}
