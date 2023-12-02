import { call, put, select } from 'redux-saga/effects'
import { printProfile } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { timeStamp } from '@/utils/day'
import { FONT_SIZE, Profile, SEPARATOR, Submission } from '../utils'
import { hasAnyKeyValue } from '@/utils/object'
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { BASE64 } from '@/utils/CONSTANTS'
import { selectPrinterSubmissions } from '../selectors'

/**
 * @package
 */
export function* printProfileSaga({
  payload,
}: ReturnType<typeof printProfile>) {
  try {
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
    SunmiPrinterLibrary.setFontSize(FONT_SIZE.DEFAULT)
    SunmiPrinterLibrary.setAlignment('center')
    SunmiPrinterLibrary.setPrinterStyle('bold', true)

    SunmiPrinterLibrary.lineWrap(1)

    SunmiPrinterLibrary.setFontSize(FONT_SIZE.LARGE)
    SunmiPrinterLibrary.printText(name)
    SunmiPrinterLibrary.setFontSize(FONT_SIZE.DEFAULT)

    if (alias) {
      SunmiPrinterLibrary.printText(alias)
    }

    if (iconBase64) {
      try {
        SunmiPrinterLibrary.lineWrap(1)
        SunmiPrinterLibrary.printBitmapBase64(
          BASE64.PREFIX + iconBase64,
          BASE64.SIZE,
        )
        SunmiPrinterLibrary.lineWrap(1)
      } catch (e: any) {
        console.warn('print', e)
      }
    }

    if (description) {
      SunmiPrinterLibrary.lineWrap(1)
      SunmiPrinterLibrary.printText(description)
      SunmiPrinterLibrary.lineWrap(1)
    }

    // 肩書き
    if (hasAnyKeyValue(title, ['position', 'company', 'address'])) {
      const { position, company, address } = title

      await SunmiPrinterLibrary.printHR('line')
      if (company) {
        SunmiPrinterLibrary.printText(company)
      }
      if (position) {
        SunmiPrinterLibrary.printText(position)
      }
      if (address) {
        SunmiPrinterLibrary.printText(address)
      }
    }

    // SNS情報
    if (hasAnyKeyValue(sns, ['twitter', 'facebook', 'github', 'website'])) {
      const { twitter, facebook, github, website } = sns

      await SunmiPrinterLibrary.printHR('line')
      SunmiPrinterLibrary.setAlignment('left')
      if (twitter) {
        SunmiPrinterLibrary.printText(`X: ${twitter}`)
      }
      if (facebook) {
        SunmiPrinterLibrary.printText(`Facebook: ${facebook}`)
      }
      if (github) {
        SunmiPrinterLibrary.printText(`GitHub: ${github}`)
      }
      if (website) {
        SunmiPrinterLibrary.printText(`Website: ${website}`)
      }
      SunmiPrinterLibrary.setAlignment('center')
    }

    // QRコード
    if (hasAnyKeyValue(qr, ['url'])) {
      const { description: desc, url } = qr

      SunmiPrinterLibrary.setAlignment('center')
      await SunmiPrinterLibrary.printHR('line')
      if (desc) {
        SunmiPrinterLibrary.printText(`${desc}\n`)
        SunmiPrinterLibrary.lineWrap(1)
      }
      if (url) {
        SunmiPrinterLibrary.printQRCode(url, 8, 'low')
      }
      SunmiPrinterLibrary.lineWrap(1)
    }

    // 印刷時間
    SunmiPrinterLibrary.setAlignment('right')
    SunmiPrinterLibrary.printText(`\n${timeStamp()}`)
    SunmiPrinterLibrary.lineWrap(3)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
