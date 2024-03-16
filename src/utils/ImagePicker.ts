import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'
import ImageResizer from '@bam.tech/react-native-image-resizer'
import { readFile } from 'react-native-fs'

/**
 * 写真ライブラリから画像を取得して、BASE64に変換して返す
 */
export const fetchBase64Image = async (maxWidth: number) => {
  try{
    // maxWidth でリサイズ機能があるが、適切に動作しない
    // そのため、ここでサイズ調整やBase64計算は行わないず、パス取得のみを行う
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: false,
      selectionLimit: 1
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

    const base64 = await readFile(uri, { encoding: 'base64' })
    return base64
  } catch (e: any) {
    console.warn(e)
    return undefined
  }
}
