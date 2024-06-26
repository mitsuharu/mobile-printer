import { call, put, select } from 'redux-saga/effects'
import { printProfile } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { timeStamp } from '@/utils/day'
import { Profile, Submission } from '../utils'
import { hasAnyKeyValue } from '@/utils/object'
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { BASE64, FONT_SIZE } from '@/CONSTANTS'
import { selectPrinterSubmissions } from '../selectors'
import { validatePrinterSaga } from './printerSagaUtils'

/**
 * @package
 */
export function* printProfileSaga({
  payload,
}: ReturnType<typeof printProfile>) {
  try {
    const isPrintable: boolean = yield call(validatePrinterSaga)
    if (!isPrintable) {
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
  icon,
  alias,
  description,
  sns,
  qr,
  title,
}: Profile) {
  try {
    // 区切り線用のテキスト
    const hr = await SunmiPrinterLibrary.hr('line')

    // 名刺印刷用の transaction を開始して割り込みを防ぐ
    await SunmiPrinterLibrary.enterPrinterBuffer(true)

    SunmiPrinterLibrary.setFontSize(FONT_SIZE.DEFAULT)
    SunmiPrinterLibrary.setAlignment('center')
    SunmiPrinterLibrary.setTextStyle('bold', true)

    SunmiPrinterLibrary.lineWrap(1)

    SunmiPrinterLibrary.setFontSize(FONT_SIZE.LARGE)
    SunmiPrinterLibrary.printText(name)
    SunmiPrinterLibrary.setFontSize(FONT_SIZE.DEFAULT)

    if (alias) {
      SunmiPrinterLibrary.printText(alias)
    }

    if (hasAnyKeyValue(icon, ['base64', 'width', 'type'])) {
      const { base64, width, type } = icon
      try {
        SunmiPrinterLibrary.lineWrap(1)
        SunmiPrinterLibrary.printImage(BASE64.PREFIX + base64, width, type)
        SunmiPrinterLibrary.lineWrap(1)
      } catch (e: any) {
        console.warn('print', e)
      }
    }

    if (description) {
      SunmiPrinterLibrary.lineWrap(1)
      SunmiPrinterLibrary.printText(description)
    }

    // 肩書き
    if (hasAnyKeyValue(title, ['position', 'company', 'address'])) {
      const { position, company, address } = title

      SunmiPrinterLibrary.printText(hr)
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

      SunmiPrinterLibrary.printText(hr)
      SunmiPrinterLibrary.setAlignment('left')
      const widths = [10, 22]
      const alignments: SunmiPrinterLibrary.Alignment[] = ['left', 'left']
      if (twitter) {
        SunmiPrinterLibrary.printColumnsString(
          ['X:', twitter],
          widths,
          alignments,
        )
      }
      if (facebook) {
        SunmiPrinterLibrary.printColumnsString(
          ['Facebook:', facebook],
          widths,
          alignments,
        )
      }
      if (github) {
        SunmiPrinterLibrary.printColumnsString(
          ['GitHub:', github],
          widths,
          alignments,
        )
      }
      if (website) {
        SunmiPrinterLibrary.printColumnsString(
          ['Website:', website],
          widths,
          alignments,
        )
      }
      SunmiPrinterLibrary.setAlignment('center')
    }

    // QRコード
    if (hasAnyKeyValue(qr, ['url'])) {
      const { description: desc, url } = qr

      SunmiPrinterLibrary.setAlignment('center')
      SunmiPrinterLibrary.printText(hr)
      if (desc) {
        SunmiPrinterLibrary.printText(desc)
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
  } finally {
    await SunmiPrinterLibrary.exitPrinterBuffer(true)
  }
}
