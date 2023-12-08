import { call, fork, put, takeEvery } from 'redux-saga/effects'
import NfcManager, { NfcTech, Ndef, TagEvent } from 'react-native-nfc-manager'
import {
  assignNfcIsReading,
  assignNfcIsSupported,
  startReadingNfc,
  stopReadingNfc,
} from './slice'
import { Linking } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { MESSAGE } from '@/CONSTANTS/MESSAGE'
import { printText } from '../printer/slice'

export function* nfcSaga() {
  const isSupported: boolean = yield call(requestIsSupportedSaga)
  if (!isSupported) {
    return
  }

  yield takeEvery(startReadingNfc, startReadingNfcSaga)
  yield takeEvery(stopReadingNfc, stopReadingNfcSaga)
}

function* requestIsSupportedSaga() {
  try {
    const isSupported: boolean = yield call(NfcManager.isSupported)
    yield put(assignNfcIsSupported(isSupported))
    return isSupported
  } catch (error: any) {
    console.warn(error)
    return false
  }
}

function* requestIsEnabledSaga() {
  try {
    const isEnabled: boolean = yield call(NfcManager.isEnabled)
    if (!isEnabled) {
      const result: boolean = yield call(
        AlertAsync,
        '端末の設定から NFC を有効にしてください',
        `設定画面に移動しますか？`,
        [
          { text: MESSAGE.NO, onPress: () => false },
          { text: MESSAGE.YES, onPress: () => true },
        ],
      )
      if (result) {
        Linking.sendIntent(`android.settings.NFC_SETTINGS`)
      }
    }
    return isEnabled
  } catch (error: any) {
    console.warn(error.message)
    return false
  }
}

function* startReadingNfcSaga() {
  try {
    const isEnabled: boolean = yield call(requestIsEnabledSaga)
    if (!isEnabled) {
      return
    }
    yield put(assignNfcIsReading(true))

    yield call(NfcManager.requestTechnology, NfcTech.Ndef)

    const tag: TagEvent | null = yield call(NfcManager.getTag)
    if (tag) {
      const [{ payload }] = tag.ndefMessage
      const data: Uint8Array = payload as unknown as Uint8Array
      const result: string = yield call(Ndef.uri.decodePayload, data)
      yield fork(printNfcTextSaga, result)
    }
  } catch (error: any) {
    console.warn('startReadingNfcSaga' + error)
  } finally {
    yield call(stopReadingNfcSaga)
  }
}

function* stopReadingNfcSaga() {
  console.log('stopReadingNfcSaga')
  try {
    yield put(assignNfcIsReading(false))
    yield call(NfcManager.cancelTechnologyRequest)
  } catch (error: any) {
    console.warn('stopReadingNfcSaga' + error)
  }
}

function* printNfcTextSaga(message: string) {
  try {
    const result: boolean = yield call(
      AlertAsync,
      'NFCタグの確認',
      `「${message}」の内容で複製しますか？`,
      [
        { text: MESSAGE.NO, onPress: () => false },
        { text: MESSAGE.YES, onPress: () => true },
      ],
    )
    if (result) {
      yield put(printText({ text: message, size: 'default' }))
    }
  } catch (error: any) {
    console.warn('printNfcTextSaga' + error.message)
  }
}
