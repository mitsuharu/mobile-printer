import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call } from 'redux-saga/effects'

/**
 * @package
 */
export function* printAsciiArtChristmasSage() {
  try {
    const random = Math.floor(Math.random() * 5)
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
      case 3:
        yield call(print3)
        break
      case 4:
        yield call(print4)
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

    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('　　　＼メリークリクマース／')
    SunmiPrinterLibrary.printText('　　　　　　 　／￣ ＼')
    SunmiPrinterLibrary.printText('　　　　＿＿0⌒>　　 ヽ')
    SunmiPrinterLibrary.printText('　　 ／　　　∩⊂ﾆﾆﾆ⊃∩')
    SunmiPrinterLibrary.printText('　／　　　　 | ノ　　　　　ヽ')
    SunmiPrinterLibrary.printText('｜　　　　　/　　●　　　● | ')
    SunmiPrinterLibrary.printText('｜　　　　 |　　　( _●_)　 ミ')
    SunmiPrinterLibrary.printText('｜　　　　彡､　　　|∪|　 ､｀＼')
    SunmiPrinterLibrary.printText('｜　　　/　＿＿　　ヽノ /´>　 )')
    SunmiPrinterLibrary.printText('　＼　　(＿＿＿）　　　/　(_／')
    SunmiPrinterLibrary.printText('　　 ＼　　　|　　　　/')
    SunmiPrinterLibrary.printText('　　　　￣￣|　 ／＼　＼')
    SunmiPrinterLibrary.printText('　　　　　　|　/　　)　 )')
    SunmiPrinterLibrary.printText('　　　　　　∪　　　（　 ＼')
    SunmiPrinterLibrary.printText('　　　　　　　　　　　＼＿)')

    SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print1() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 60)

    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('　 ∩　∩')
    SunmiPrinterLibrary.printText('　.い_cノ　　／￣＞Ｏ')
    SunmiPrinterLibrary.printText('.c/・ ・っ　(ニニニ)')
    SunmiPrinterLibrary.printText('.（"●" )　.(・ω・`)')

    await SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print2() {
  try {
    const printSantaAndReindeer = () => {
      SunmiPrinterLibrary.printText('　∩　∩')
      SunmiPrinterLibrary.printText('　い_cノ　 ／￣＞Ｏ')
      SunmiPrinterLibrary.printText('.c/･ ･っ　(ニニﾆ)△△')
      SunmiPrinterLibrary.printText('（"●" )　.(･ω･`)[∥]')
      SunmiPrinterLibrary.printText('Ｏ┳Ｏﾉ)=[￣てﾉ￣￣]')
      SunmiPrinterLibrary.printText('◎┻し◎　◎――◎=3')
    }

    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 120)

    SunmiPrinterLibrary.lineWrap(2)

    printSantaAndReindeer()

    SunmiPrinterLibrary.lineWrap(1)

    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 60)

    printSantaAndReindeer()

    SunmiPrinterLibrary.lineWrap(1)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 0)

    printSantaAndReindeer()

    await SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print3() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 110)
    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('。☆。°。☆')
    SunmiPrinterLibrary.printText('ζζ☆°。°')
    SunmiPrinterLibrary.printText('/^^|＼____彡')
    SunmiPrinterLibrary.printText('●ノ＼　　 )')
    SunmiPrinterLibrary.printText('　　<<<￣///')
    SunmiPrinterLibrary.printText('⌒⌒⌒⌒⌒⌒⌒')

    SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print4() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 50)
    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('.　　 　  ☆')
    SunmiPrinterLibrary.printText('　　 　 ／  ＼')
    SunmiPrinterLibrary.printText('　 　  ／★∴＼')
    SunmiPrinterLibrary.printText('　 　 (人_人_人)')
    SunmiPrinterLibrary.printText('　   ／ ∴∵★ ＼')
    SunmiPrinterLibrary.printText('　 (_人_人_人_人_)')
    SunmiPrinterLibrary.printText('　 ／ ☆∴∵∴   ＼')
    SunmiPrinterLibrary.printText('　(_人★人☆人★人_)')
    SunmiPrinterLibrary.printText('　　    ￣凵￣　　　 ')
    SunmiPrinterLibrary.printText('　　　 ―=☆=―')

    SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}
