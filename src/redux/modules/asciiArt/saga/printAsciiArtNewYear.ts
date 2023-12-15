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

    await SunmiPrinterLibrary.printText('　　┏━━━┓')
    await SunmiPrinterLibrary.printText('　　┃　賀　┃')
    await SunmiPrinterLibrary.printText('　　┃　正　┃')
    await SunmiPrinterLibrary.printText('　　┗━┳━┛')
    await SunmiPrinterLibrary.printText('　 ∧∧ ┃')
    await SunmiPrinterLibrary.printText('　( ﾟ∀ﾟ)○')
    await SunmiPrinterLibrary.printText('　〉 ⌒つ')
    await SunmiPrinterLibrary.printText('　(⌒)丿┃')
    await SunmiPrinterLibrary.printText('　(_)〉　　')
    await SunmiPrinterLibrary.printText('　／~~~＼')
    await SunmiPrinterLibrary.printText('あけまして')
    await SunmiPrinterLibrary.printText('　おめでとうごさいます')

    await SunmiPrinterLibrary.lineWrap(3)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function print1() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)

    await SunmiPrinterLibrary.printText('　　┏━━━┓')
    await SunmiPrinterLibrary.printText('　　┃　賀　┃')
    await SunmiPrinterLibrary.printText('　　┃　正　┃')
    await SunmiPrinterLibrary.printText('　　┗━┳━┛')
    await SunmiPrinterLibrary.printText('　 ∧∧ ┃')
    await SunmiPrinterLibrary.printText('　( ﾟ∀ﾟ)○')
    await SunmiPrinterLibrary.printText('　〉 ⌒つ')
    await SunmiPrinterLibrary.printText('　(⌒)丿┃')
    await SunmiPrinterLibrary.printText('　(_)〉　　')
    await SunmiPrinterLibrary.printText('　／~~~＼')
    await SunmiPrinterLibrary.printText('あけまして')
    await SunmiPrinterLibrary.printText('　おめでとうごさいます')

    await SunmiPrinterLibrary.lineWrap(3)
  } catch (error: any) {
    console.warn(error.message)
  }
}
