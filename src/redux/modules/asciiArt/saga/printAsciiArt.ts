import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call } from 'redux-saga/effects'

/**
 * @package
 */
export function* printAsciiSage() {
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

    await SunmiPrinterLibrary.printText('みんな幸せになぁれ♬')
    await SunmiPrinterLibrary.printText('　∧,＿,∧　')
    await SunmiPrinterLibrary.printText('（`・ω・)つ━☆・*。')
    await SunmiPrinterLibrary.printText('⊂　　 ノ 　　　・゜+.')
    await SunmiPrinterLibrary.printText('　し’´Ｊ　　*・ °”')

    await SunmiPrinterLibrary.lineWrap(3)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print1() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)

    await SunmiPrinterLibrary.printText('┣””””┣””””┣””””┣””””┣””””')
    await SunmiPrinterLibrary.printText('┣””””┣””””┣””””┣””””┣””””')
    await SunmiPrinterLibrary.printText('シャキーン！！')
    await SunmiPrinterLibrary.printText('　　　　∧_,,∧')
    await SunmiPrinterLibrary.printText('.　　　(｀・ω・)')
    await SunmiPrinterLibrary.printText('((;　＼と　　　つ')
    await SunmiPrinterLibrary.printText('((（;;　ミ三三彡')

    await SunmiPrinterLibrary.lineWrap(3)
  } catch (error: any) {
    console.warn(error.message)
  }
}
