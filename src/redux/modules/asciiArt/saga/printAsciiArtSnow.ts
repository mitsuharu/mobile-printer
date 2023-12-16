import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call } from 'redux-saga/effects'

/**
 * @package
 */
export function* printAsciiArtSnowSage() {
  try {
    yield call(printSnow)
  } catch (error: any) {
    console.warn(error.message)
  }
}

async function printSnow() {
  try {
    await SunmiPrinterLibrary.resetPrinterStyle()
    await SunmiPrinterLibrary.setTextStyle('bold', true)
    await SunmiPrinterLibrary.setParagraphStyle('leftSpacing', 30)
    SunmiPrinterLibrary.lineWrap(2)

    // 33％で雪が積もる
    if (Math.floor(Math.random() * 9) % 3 === 0 || true) {
      SunmiPrinterLibrary.printText('︶︶︶︶︶︶︶︶︶︶︶︶︶︶')
      SunmiPrinterLibrary.printText('　*( 　 )*　')
      SunmiPrinterLibrary.printText('　  (‥)　。')
      SunmiPrinterLibrary.printText('　。 uu 　')
      SunmiPrinterLibrary.lineWrap(1)
    }

    SunmiPrinterLibrary.printText('　　　　.　　 。 　　ﾟ 　　　　')
    SunmiPrinterLibrary.printText('.　　 。 　　ﾟ 　　　　　　　ﾟ　　。')
    SunmiPrinterLibrary.printText('　　 　 　 　。　 　　　　　ﾟ　　 　 o')
    SunmiPrinterLibrary.printText(' 　｡　 　ﾟ 　　.　　　　゜　　　　。　　　o')
    SunmiPrinterLibrary.printText('゜　　.　　　 　 ﾟ　 　 。 　　 o')
    SunmiPrinterLibrary.printText('　ﾟ　　　。　 　 　 　 o　 　 　')
    SunmiPrinterLibrary.printText('　　　　ﾟ　　　　 　 o　　')
    SunmiPrinterLibrary.printText('　　　　　　　゜　 　 。　　　　　○　')
    SunmiPrinterLibrary.printText('　　　　　　 　 　　　　　　　　　ﾟ')
    SunmiPrinterLibrary.printText('　○　　　　　　゜　　　　　　　　　o')
    SunmiPrinterLibrary.printText('　　　。　　　　　　　　o　')
    SunmiPrinterLibrary.printText('。　　　　　　　　゜　　')
    SunmiPrinterLibrary.printText(' 　　　　　　　　o　　　。　。')
    SunmiPrinterLibrary.printText('   。　　　　。　　　　o　')
    SunmiPrinterLibrary.printText('　o　　　｡　　　　　　　　｡　゜')
    SunmiPrinterLibrary.printText('　　o　　　　｡　　○　　　　　　゜')
    SunmiPrinterLibrary.printText('　　。　　　　　　　　゜　　')
    SunmiPrinterLibrary.printText('　　　　　o　　　　｡　　○　　　　　')
    SunmiPrinterLibrary.printText('　　　o　　　　　　　⌒　　')
    SunmiPrinterLibrary.printText('  。　　　o　 　 　.　　　　 。')
    SunmiPrinterLibrary.printText(' 　 　 o　 　 　 　 　 。　ﾟ　')
    SunmiPrinterLibrary.printText('　｡　　○　　　　　　゜。')
    SunmiPrinterLibrary.printText('　　　。　　　　　　゜　　　　　o　　゜　ﾟ')
    SunmiPrinterLibrary.printText('　.　　　　　゜　　　　')
    SunmiPrinterLibrary.printText('　　　　o　　　　　　。　　　　　　　　')
    SunmiPrinterLibrary.printText('｡　　○　')
    SunmiPrinterLibrary.printText('。   o　　　　　　゜　 　 。　　　　　○　')
    SunmiPrinterLibrary.printText('　　　　　　　　　　o　　o　　　　　　゜')
    SunmiPrinterLibrary.printText('　　　　　　　゜　 　 。　　　　　○')
    SunmiPrinterLibrary.printText('゜　　.　　　 　 ﾟ　 　 。 　　 ')
    SunmiPrinterLibrary.printText('　　　　゜　　　　　　　　　o')
    SunmiPrinterLibrary.printText('　　○　　　　　　゜　')
    SunmiPrinterLibrary.printText('　。　　　　　　　　゜　　　　　　。　')

    SunmiPrinterLibrary.lineWrap(5)
    SunmiPrinterLibrary.resetPrinterStyle()
  } catch (error: any) {
    console.warn(error.message)
  }
}
