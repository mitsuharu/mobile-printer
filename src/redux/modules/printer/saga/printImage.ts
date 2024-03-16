import { call, put } from 'redux-saga/effects'
import { printImage, printImageFromImagePicker } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { ImageSource } from '../utils'
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { BASE64 } from '@/CONSTANTS'
import { validatePrinterSaga } from './printerSagaUtils'
import { fetchBase64Image } from '@/utils/ImagePicker'

/**
 * @package
 */
export function* printImageSaga({ payload }: ReturnType<typeof printImage>) {
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
export function* printImageFromImagePickerSaga({
  payload,
}: ReturnType<typeof printImageFromImagePicker>) {
  try {
    const { base64, width }: GetImageBase64Result = yield call(getImageBase64)
    if (base64) {
      yield put(printImage({ base64: base64, type: payload, width: width }))
    }
  } catch (e: any) {
    console.warn('printSaga', e)
    yield put(
      enqueueSnackbar({
        message: `印刷データが取得できませんでした`,
      }),
    )
  }
}

type GetImageBase64Result = { base64: string | undefined; width: number }
async function getImageBase64(): Promise<GetImageBase64Result> {
  try {
    const base64 = await fetchBase64Image(BASE64.MAX_SIZE)
    return { base64: base64, width: BASE64.MAX_SIZE }
  } catch (e: any) {
    console.warn(e)
    return { base64: undefined, width: 0 }
  }
}

async function print({ base64, type, width }: ImageSource) {
  try {
    SunmiPrinterLibrary.setAlignment('center')
    SunmiPrinterLibrary.lineWrap(1)

    SunmiPrinterLibrary.printImage(BASE64.PREFIX + base64, width, type)

    SunmiPrinterLibrary.lineWrap(6)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
