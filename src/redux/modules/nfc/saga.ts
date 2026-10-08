import { Linking } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import NfcManager, {
  Ndef,
  NfcTech,
  type TagEvent,
} from 'react-native-nfc-manager'
import { call, fork, put, takeEvery } from 'redux-saga/effects'
import { MESSAGE } from '@/CONSTANTS'
import { printText } from '../printer/slice'
import {
  assignNfcIsReading,
  assignNfcIsSupported,
  startReadingNfc,
  stopReadingNfc,
} from './slice'

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
    console.warn('requestIsSupportedSaga', error.message)
    return false
  }
}

function* requestIsEnabledSaga() {
  try {
    const isEnabled: boolean = yield call(NfcManager.isEnabled)
    if (!isEnabled) {
      const result: boolean = yield call(
        AlertAsync,
        'Enable NFC in the device settings',
        'Open settings?\n\nSome models do not support NFC. Check whether your device supports it.',
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
    console.warn('requestIsEnabledSaga', error.message)
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
    console.warn('startReadingNfcSaga', error.message)
  } finally {
    yield call(stopReadingNfcSaga)
  }
}

function* stopReadingNfcSaga() {
  try {
    yield put(assignNfcIsReading(false))
    yield call(NfcManager.cancelTechnologyRequest)
  } catch (error: any) {
    console.warn('stopReadingNfcSaga', error.message)
  }
}

function* printNfcTextSaga(message: string) {
  try {
    const result: boolean = yield call(
      AlertAsync,
      'Confirm NFC tag',
      `Copy this content: ${message}?`,
      [
        { text: MESSAGE.NO, onPress: () => false },
        { text: MESSAGE.YES, onPress: () => true },
      ],
    )
    if (result) {
      yield put(printText({ text: message, size: 'default' }))
    }
  } catch (error: any) {
    console.warn('printNfcTextSaga', error.message)
  }
}
