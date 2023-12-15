import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call } from 'redux-saga/effects'

/**
 * @package
 */
export function* printAsciiArtChristmasSage() {
  try {
    const random = Math.floor(Math.random() * 2)
    switch (random) {
      case 0:
        yield call(print0)
        break
      case 1:
        yield call(print1)
        break
      default:
        yield call(print0)
        break
    }
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print0() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)

    await SunmiPrinterLibrary.printText('　　　＼メリークリクマース／')
    await SunmiPrinterLibrary.printText('　　　　　　 　／￣ ＼')
    await SunmiPrinterLibrary.printText('　　　　＿＿0⌒>　　 ヽ')
    await SunmiPrinterLibrary.printText('　　 ／　　　∩⊂ﾆﾆﾆ⊃∩')
    await SunmiPrinterLibrary.printText('　／　　　　 | ノ　　　　　ヽ')
    await SunmiPrinterLibrary.printText('｜　　　　　/　　●　　　● | ')
    await SunmiPrinterLibrary.printText('｜　　　　 |　　　( _●_)　 ミ')
    await SunmiPrinterLibrary.printText('｜　　　　彡､　　　|∪|　 ､｀＼')
    await SunmiPrinterLibrary.printText('｜　　　/　＿＿　　ヽノ /´>　 )')
    await SunmiPrinterLibrary.printText('　＼　　(＿＿＿）　　　/　(_／')
    await SunmiPrinterLibrary.printText('　　 ＼　　　|　　　　/')
    await SunmiPrinterLibrary.printText('　　　　￣￣|　 ／＼　＼')
    await SunmiPrinterLibrary.printText('　　　　　　|　/　　)　 )')
    await SunmiPrinterLibrary.printText('　　　　　　∪　　　（　 ＼')
    await SunmiPrinterLibrary.printText('　　　　　　　　　　　＼＿)')

    await SunmiPrinterLibrary.lineWrap(3)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print1() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)

    await SunmiPrinterLibrary.printText('　∩　∩')
    await SunmiPrinterLibrary.printText('　い_cノ　 ／￣＞Ｏ')
    await SunmiPrinterLibrary.printText('.c/･ ･っ　(ニニﾆ)△△')
    await SunmiPrinterLibrary.printText('（"●" )　.(･ω･`)[∥]')
    await SunmiPrinterLibrary.printText('Ｏ┳Ｏﾉ)=[￣てﾉ￣￣]')
    await SunmiPrinterLibrary.printText('◎┻し◎　◎――◎=3')

    await SunmiPrinterLibrary.lineWrap(3)
  } catch (error: any) {
    console.warn(error.message)
  }
}
