import { call, fork, put, takeEvery } from 'redux-saga/effects'
import { print } from './slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { Platform } from 'react-native'
import { timeStamp } from '@/utils/day'
import { FONT_SIZE, Profile, SEPARATOR } from './utils'
import { hasAnyKeyValue } from '@/utils/object'
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer'
import { BASE64 } from '@/utils/CONSTANTS'
import { isEmulator, getBrand } from 'react-native-device-info'

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
    SunmiPrinter.setFontSize(FONT_SIZE.DEFAULT)
    SunmiPrinter.setAlignment(AlignValue.CENTER)
    SunmiPrinter.setFontWeight(true)

    SunmiPrinter.lineWrap(1)

    SunmiPrinter.setFontSize(FONT_SIZE.LARGE)
    SunmiPrinter.setFontWeight(true)
    SunmiPrinter.printerText(`${name}\n`)
    SunmiPrinter.setFontSize(FONT_SIZE.DEFAULT)

    if (alias) {
      SunmiPrinter.printerText(`${alias}\n`)
    }

    if (iconBase64) {
      try {
        SunmiPrinter.lineWrap(1)
        SunmiPrinter.printBitmap(BASE64.PREFIX + iconBase64, BASE64.SIZE)
        SunmiPrinter.lineWrap(1)
      } catch (e: any) {
        console.warn('print', e)
      }
    }

    if (description) {
      SunmiPrinter.lineWrap(1)
      SunmiPrinter.printerText(`${description}\n`)
      SunmiPrinter.lineWrap(1)
    }

    // 肩書き
    if (hasAnyKeyValue(title, ['position', 'company', 'address'])) {
      const { position, company, address } = title

      SunmiPrinter.printerText(SEPARATOR)
      if (company) {
        SunmiPrinter.printerText(`${company}\n`)
      }
      if (position) {
        SunmiPrinter.printerText(`${position}\n`)
      }
      if (address) {
        SunmiPrinter.printerText(`${address}\n`)
      }
    }

    // SNS情報
    if (hasAnyKeyValue(sns, ['twitter', 'facebook', 'github', 'website'])) {
      const { twitter, facebook, github, website } = sns

      SunmiPrinter.printerText(SEPARATOR)
      SunmiPrinter.setAlignment(AlignValue.LEFT)
      if (twitter) {
        SunmiPrinter.printerText(`X: ${twitter}\n`)
      }
      if (facebook) {
        SunmiPrinter.printerText(`Facebook: ${facebook}\n`)
      }
      if (github) {
        SunmiPrinter.printerText(`GitHub: ${github}\n`)
      }
      if (website) {
        SunmiPrinter.printerText(`Website: ${website}\n`)
      }
      SunmiPrinter.setAlignment(AlignValue.CENTER)
    }

    // QRコード
    if (hasAnyKeyValue(qr, ['url'])) {
      const { description: desc, url } = qr

      SunmiPrinter.setAlignment(AlignValue.CENTER)
      SunmiPrinter.printerText(SEPARATOR)
      if (desc) {
        SunmiPrinter.printerText(`${desc}\n`)
        SunmiPrinter.lineWrap(1)
      }
      if (url) {
        SunmiPrinter.printQRCode(url, 8, 1)
      }
      SunmiPrinter.lineWrap(1)
    }

    // 印刷時間
    SunmiPrinter.setAlignment(AlignValue.RIGHT)
    SunmiPrinter.printerText(`\n${timeStamp()}\n`)
    SunmiPrinter.lineWrap(3)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
