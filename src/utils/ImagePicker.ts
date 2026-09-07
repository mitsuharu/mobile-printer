import ImageResizer from '@bam.tech/react-native-image-resizer'
import {
  type ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker'

/**
 * 写真ライブラリから画像を取得して、リサイズしたファイルのパスを返す
 */
export const fetchResizedImagePath = async (maxWidth: number) => {
  try {
    // maxWidth でリサイズ機能があるが、適切に動作しない
    // そのため、ここでサイズ調整やBase64計算は行わないず、パス取得のみを行う
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      selectionLimit: 1,
    }
    const { assets } = await launchImageLibrary(options)
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
  } catch (e: any) {
    console.warn(e)
    return undefined
  }
}
