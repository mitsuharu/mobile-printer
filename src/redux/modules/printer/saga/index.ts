import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { Platform } from 'react-native'
import { getBrand, isEmulator } from 'react-native-device-info'
import { call, fork, put, takeEvery, takeLeading } from 'redux-saga/effects'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import {
  assignIsPrintable,
  duplicateQRCode,
  printImage,
  printImageFromImagePicker,
  printProfile,
  printProfileRandomly,
  printQRCode,
  printText,
} from '../slice'
import { getPrinterInfoSaga } from './printerSagaUtils'
import { printImageFromImagePickerSaga, printImageSaga } from './printImage'
import { printProfileRandomlySaga, printProfileSaga } from './printProfile'
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
  yield takeLeading(printProfile, printProfileSaga)
  yield takeLeading(printProfileRandomly, printProfileRandomlySaga)
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
          message: `シミュレーターなので印刷できません`,
        }),
      )
      return
    }

    const brand: string = yield call(getBrand)
    if (!brand.toLocaleLowerCase().includes('sunmi')) {
      yield put(
        enqueueSnackbar({
          message: `SUNMI端末を使用してください`,
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
        message: `プリンターの接続に失敗しました`,
      }),
    )
  }
}
