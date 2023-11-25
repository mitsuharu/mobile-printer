import { call, fork, put, takeEvery } from 'redux-saga/effects'
import {
  printImage,
  printImageFromImagePicker,
  printProfile,
  printText,
} from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { Platform } from 'react-native'
import SunmiPrinter from '@heasy/react-native-sunmi-printer'
import { isEmulator, getBrand } from 'react-native-device-info'
import { printProfileSaga } from './printProfile'
import { printTextSaga } from './printText'
import { printImageFromImagePickerSaga, printImageSaga } from './printImage'

export function* printerSaga() {
  if (Platform.OS !== 'android') {
    console.warn(`printerSaga, It supports only Android.`)
    // Android のみ対応する
    return
  }

  yield fork(printInitSaga)
  yield takeEvery(printProfile, printProfileSaga)
  yield takeEvery(printText, printTextSaga)
  yield takeEvery(printImage, printImageSaga)
  yield takeEvery(printImageFromImagePicker, printImageFromImagePickerSaga)
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

    yield call(SunmiPrinter.printerInit)
  } catch (e: any) {
    console.warn('printInitSaga', e)
    yield put(
      enqueueSnackbar({
        message: `プリンターの接続に失敗しました`,
      }),
    )
  }
}
