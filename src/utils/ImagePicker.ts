import ImageResizer from '@bam.tech/react-native-image-resizer'
import {
  type ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker'

/**
 * 写真ライブラリから画像を取得して、リサイズしたファイルのパスを返す
 *
 * @returns 選ばれた画像のパス。選ばずに閉じたときは `undefined`
 *
 * @note
 * 失敗はそのまま投げる。以前は握り潰して `undefined` を返していたが、
 * それでは「選ばずに閉じた」と区別が付かず、呼び出し側が何も知らせられない。
 * `launchImageLibrary` は失敗しても例外を投げず `errorCode` で返すため、
 * ここで投げ直す。
 */
export const fetchResizedImagePath = async (maxWidth: number) => {
  // maxWidth でリサイズ機能があるが、適切に動作しない
  // そのため、ここでサイズ調整やBase64計算は行わないず、パス取得のみを行う
  const options: ImageLibraryOptions = {
    mediaType: 'photo',
    includeBase64: false,
    selectionLimit: 1,
  }
  const { didCancel, errorCode, errorMessage, assets } =
    await launchImageLibrary(options)
  if (didCancel) {
    return undefined
  }
  // 失敗は例外ではなく `errorCode` で返る。投げ直して呼び出し側へ伝える
  if (errorCode) {
    throw new Error(
      `launchImageLibrary failed: ${errorCode}${errorMessage ? ` ${errorMessage}` : ''}`,
    )
  }
  if (!assets) {
    return undefined
  }

  const [{ uri: path, width, height }] = assets
  if (!path || !width || !height) {
    return undefined
  }

  const { uri } = await ImageResizer.createResizedImage(
    path,
    maxWidth,
    (maxWidth * height) / width,
    'PNG',
    80,
    0,
  )

  return uri
}
