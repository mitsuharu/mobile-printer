import { call, put, select } from 'redux-saga/effects'
import { printProfile } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { timeStamp } from '@/utils/day'
import { FONT_SIZE, Profile, SEPARATOR, Submission } from '../utils'
import { hasAnyKeyValue } from '@/utils/object'
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer'
import { BASE64 } from '@/utils/CONSTANTS'
import { selectPrinterSubmissions } from '../selectors'

/**
 * @package
 */
export function* printProfileSaga({
  payload,
}: ReturnType<typeof printProfile>) {
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

/**
 * @package
 */
export function* printProfileRandomlySaga() {
  try {
    const submissions: Submission[] = yield select(selectPrinterSubmissions)
    if (submissions.length === 0) {
      yield put(
        enqueueSnackbar({
          message: `印刷できるプロフィールデータがありません`,
        }),
      )
      return
    }

    const index = Math.floor(Math.random() * submissions.length)
    const { profile } = submissions[index]
    yield put(printProfile(profile))
  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷に失敗しました`,
      }),
    )
  }
}

async function print({
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
