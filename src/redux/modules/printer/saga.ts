import { call, fork, put, takeEvery } from 'redux-saga/effects'
import { print } from './slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { SPrinter, Constants } from '@makgabri/react-native-sunmi-printer'
import { Platform } from 'react-native'
import { timeStamp } from '@/utils/day'
import { Profile, SEPARATOR } from './utils'
import { hasAnyObject } from '@/utils/object'

export function* printerSaga() {
  if (Platform.OS !== 'android') {
    console.warn(`printerSaga, It supports only Android.`)
    // Android のみ対応する
    return
  }

  yield fork(printInitSaga)
  yield takeEvery(print, printSaga)
}

function* printInitSaga() {
  console.log(`printInitSaga`)
  try {
    yield call(SPrinter.connect)
    yield call(SPrinter.disconnect)
  } catch (e: any) {
    console.warn('printInitSaga', e)
    yield put(
      enqueueSnackbar({
        message: `プリンターの接続に失敗しました`,
      }),
    )
  }
}

function* printSaga({ payload }: ReturnType<typeof print>) {
  try {
    yield call(printProfile, payload)
  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷に失敗しました`,
      }),
    )
  }
}

async function printProfile({
  name,
  iconBase64,
  alias,
  description,
  sns,
  qr,
  title,
}: Profile) {
  try {
    await SPrinter.connect()
    await SPrinter.printEmptyLines(1)

    await SPrinter.setAlign(Constants.Align.CENTER)
    await SPrinter.printTextCustom(`${name}\n`, 32, true, false, 'gh')

    if (alias) {
      await SPrinter.printText(`${alias}\n`)
    }

    if (iconBase64) {
      await SPrinter.printEmptyLines(1)
      await SPrinter.printBase64Image(iconBase64)
      await SPrinter.printEmptyLines(1)
    }

    if (description) {
      await SPrinter.printEmptyLines(1)
      await SPrinter.printText(`${description}\n`)
      await SPrinter.printEmptyLines(1)
    }

    // 肩書き
    if (hasAnyObject(title)) {
      const { position, company, address } = title
      await SPrinter.printText(SEPARATOR)
      if (company) {
        await SPrinter.printText(`${company}\n`)
      }
      if (position) {
        await SPrinter.printText(`${position}\n`)
      }
      if (address) {
        await SPrinter.printText(`${address}\n`)
      }
    }

    // SNS情報
    if (hasAnyObject(sns)) {
      await SPrinter.printText(SEPARATOR)
      await SPrinter.setAlign(Constants.Align.LEFT)
      const { twitter, facebook, github, website } = sns
      if (twitter) {
        await SPrinter.printText(`Twitter: ${twitter}\n`)
      }
      if (facebook) {
        await SPrinter.printText(`Facebook: ${facebook}\n`)
      }
      if (github) {
        await SPrinter.printText(`Github: ${github}\n`)
      }
      if (website) {
        await SPrinter.printText(`Website: ${website}\n`)
      }
    }

    // QRコード
    if (hasAnyObject(qr)) {
      await SPrinter.setAlign(Constants.Align.CENTER)
      await SPrinter.printText(SEPARATOR)
      await SPrinter.setAlign(Constants.Align.CENTER)
      if (qr.description) {
        await SPrinter.printText(`${qr.description}\n`)
        await SPrinter.printEmptyLines(1)
      }
      if (qr.url) {
        await SPrinter.printQRCode(qr.url, 8, 1)
      }
      await SPrinter.printEmptyLines(1)
    }

    // 印刷時間
    await SPrinter.setAlign(Constants.Align.RIGHT)
    await SPrinter.printText(`\n${timeStamp()}\n`)
    await SPrinter.printEmptyLines(3)

    // 終了
    await SPrinter.reset()
    await SPrinter.disconnect()
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
