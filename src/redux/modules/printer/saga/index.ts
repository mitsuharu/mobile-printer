import { call, fork, put, takeEvery } from 'redux-saga/effects'
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
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { Platform } from 'react-native'
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { isEmulator, getBrand } from 'react-native-device-info'
import { printProfileRandomlySaga, printProfileSaga } from './printProfile'
import { printTextSaga } from './printText'
import { printImageFromImagePickerSaga, printImageSaga } from './printImage'
import {
  duplicateQRCodeSaga,
  monitorScanSuccessSaga,
  printQRCodeSaga,
} from './printQRCode'

export function* printerSaga() {
  if (Platform.OS !== 'android') {
    console.warn(`printerSaga, It supports only Android.`)
    // Android のみ対応する
    return
  }

  yield fork(printInitSaga)
  yield fork(monitorScanSuccessSaga)
  yield takeEvery(printProfile, printProfileSaga)
  yield takeEvery(printProfileRandomly, printProfileRandomlySaga)
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
