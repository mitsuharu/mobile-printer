import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call } from 'redux-saga/effects'

/**
 * @package
 */
export function* printAsciiArtSage() {
  try {
    const random = Math.floor(Math.random() * 3)
    switch (random) {
      case 0:
        yield call(print0)
        break
      case 1:
        yield call(print1)
        break
      case 2:
        yield call(print2)
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
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 60)
    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('みんな幸せになぁれ♬')
    SunmiPrinterLibrary.printText('　∧＿∧　')
    SunmiPrinterLibrary.printText('（`・ω・)つ━☆・*。')
    SunmiPrinterLibrary.printText('⊂　　 ノ 　　　・゜+.')
    SunmiPrinterLibrary.printText('　し’´Ｊ　　*・ °”')

    SunmiPrinterLibrary.lineWrap(5)
    SunmiPrinterLibrary.resetPrinterStyle()
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print1() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 20)
    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('┣””””┣””””┣””””┣””””┣””””')
    SunmiPrinterLibrary.printText('┣””””┣””””┣””””┣””””┣””””')
    SunmiPrinterLibrary.printText('シャキーン！！')
    SunmiPrinterLibrary.printText('　　　　∧_,,∧')
    SunmiPrinterLibrary.printText('.　　　(｀・ω・)')
    SunmiPrinterLibrary.printText('((;　＼と　　　つ')
    SunmiPrinterLibrary.printText('((（;;　ミ三三彡')

    SunmiPrinterLibrary.lineWrap(5)
    SunmiPrinterLibrary.resetPrinterStyle()
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print2() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 60)
    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('　  _, ,_ 　ﾊﾟｰﾝ')
    SunmiPrinterLibrary.printText('　（　‘д‘）')
    SunmiPrinterLibrary.printText('　　⊂彡☆))Д´）')

    SunmiPrinterLibrary.lineWrap(5)
    SunmiPrinterLibrary.resetPrinterStyle()
  } catch (error: any) {
    console.warn(error.message)
  }
}
