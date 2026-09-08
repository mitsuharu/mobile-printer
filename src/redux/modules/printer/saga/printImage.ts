import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library'
import { call, put } from 'redux-saga/effects'
import { BASE64 } from '@/CONSTANTS'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { fetchResizedImagePath } from '@/utils/ImagePicker'
import { readImageFile } from '@/utils/imageStore'
import { printImage, type printImageFromImagePicker } from '../slice'
import type { ImageSource } from '../utils'
import { validatePrinterSaga } from './printerSagaUtils'

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

/**
 * @note
 * 失敗は投げて、呼び出し側で知らせる。握り潰すと「選ばずに閉じた」と同じ
 * 扱いになり、何も起きないまま終わってしまう。
 */
async function getImageBase64(): Promise<GetImageBase64Result> {
  const path = await fetchResizedImagePath(BASE64.MAX_SIZE)
  if (!path) {
    return { base64: undefined, width: 0 }
  }
  return { base64: await readImageFile(path), width: BASE64.MAX_SIZE }
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
