import { call, put } from 'redux-saga/effects'
import { printImage, printImageFromImagePicker } from '../slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { ImageSource } from '../utils'
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer'
import { BASE64 } from '@/utils/CONSTANTS'
import MultipleImagePicker, {
  MediaType,
} from '@baronha/react-native-multiple-image-picker'
import ImageResizer from '@bam.tech/react-native-image-resizer'
import { readFile } from 'react-native-fs'

/**
 * @package
 */
export function* printImageSaga({ payload }: ReturnType<typeof printImage>) {
  try {
    const hasPrinter: boolean = yield call(SunmiPrinter.hasPrinter)
    if (!hasPrinter) {
      yield put(
        enqueueSnackbar({
          message: `ご利用の端末にプリンターがありません。`,
        }),
      )
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
    const base64: string | undefined = yield call(getImageBase64)
    if (base64) {
      yield put(printImage({ base64: base64, type: payload }))
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

async function getImageBase64() {
  try {
    const { path, width, height } = await MultipleImagePicker.openPicker({
      mediaType: 'image' as MediaType,
      usedCameraButton: false,
      isPreview: false,
      singleSelectedMode: true,
    })

    const { uri } = await ImageResizer.createResizedImage(
      path,
      BASE64.MAX_SIZE,
      (BASE64.MAX_SIZE * height) / width,
      'PNG',
      80,
      0,
    )

    const base64Data = await readFile(uri, { encoding: 'base64' })

    return base64Data
  } catch (e: any) {
    console.warn(e)
    return undefined
  }
}

async function print({ base64, type }: ImageSource) {
  try {
    SunmiPrinter.setAlignment(AlignValue.CENTER)

    SunmiPrinter.lineWrap(1)

    switch (type) {
      case 'grayscale':
        SunmiPrinter.printBitmapCustomBase64(
          BASE64.PREFIX + base64,
          BASE64.MAX_SIZE,
          2,
        )
        break
      default:
        SunmiPrinter.printBitmap(BASE64.PREFIX + base64, BASE64.MAX_SIZE)
        break
    }

    SunmiPrinter.lineWrap(6)
  } catch (e: any) {
    console.warn('print', e)
    throw e
  }
}
