import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call } from 'redux-saga/effects'

/**
 * @package
 */
export function* printAsciiArtNewYearSage() {
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
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 60)

    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('　　┏━━━┓')
    SunmiPrinterLibrary.printText('　　┃　賀　┃')
    SunmiPrinterLibrary.printText('　　┃　正　┃')
    SunmiPrinterLibrary.printText('　　┗━┳━┛')
    SunmiPrinterLibrary.printText('　 ∧∧ ┃')
    SunmiPrinterLibrary.printText('　( ﾟ∀ﾟ)○')
    SunmiPrinterLibrary.printText('　〉 ⌒つ')
    SunmiPrinterLibrary.printText('　(⌒)丿┃')
    SunmiPrinterLibrary.printText('　(_)〉　　')
    SunmiPrinterLibrary.printText('　／~~~＼')
    SunmiPrinterLibrary.printText('あけまして')
    SunmiPrinterLibrary.printText('　おめでとうごさいます')

    SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print1() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 80)
    SunmiPrinterLibrary.lineWrap(2)

    SunmiPrinterLibrary.printText('　　　./|')
    SunmiPrinterLibrary.printText('　　　|-|')
    SunmiPrinterLibrary.printText('　 ノl|-|lヽ')
    SunmiPrinterLibrary.printText('　 |ｰ||-|!-|.')
    SunmiPrinterLibrary.printText('　 爨爨爨爨爨')
    SunmiPrinterLibrary.printText('　 [[[[[[[[[]')
    SunmiPrinterLibrary.printText('　_|_|_|_|_|_|_　')

    SunmiPrinterLibrary.lineWrap(5)
  } catch (error: any) {
    console.warn(error.message)
  }
}
