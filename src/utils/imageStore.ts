import {
  copyFile,
  DocumentDirectoryPath,
  exists,
  mkdir,
  readFile,
  unlink,
  writeFile,
} from 'react-native-fs'

/**
 * 印刷に使う画像を置く場所
 */
export const IMAGE_DIRECTORY = `${DocumentDirectoryPath}/images`

/**
 * 画像1件のパス
 */
export const imagePath = (id: string) => `${IMAGE_DIRECTORY}/${id}.png`

const ensureDirectory = async () => {
  if (!(await exists(IMAGE_DIRECTORY))) {
    await mkdir(IMAGE_DIRECTORY)
  }
}

/**
 * Base64 の画像をファイルとして保存し、そのパスを返す
 *
 * 同じIDで保存し直すと上書きする。
 */
export const saveImageFile = async (
  id: string,
  base64: string,
): Promise<string> => {
  await ensureDirectory()
  const path = imagePath(id)
  await writeFile(path, base64, 'base64')
  return path
}

/**
 * 保存した画像を Base64 で読む
 *
 * プリンターは Base64 しか受け取らないため、印刷するときだけ読む。
 */
export const readImageFile = (path: string): Promise<string> =>
  readFile(path, 'base64')

/**
 * 保存した画像を削除する
 *
 * すでに無い場合は何もしない。
 */
export const deleteImageFile = async (path: string): Promise<void> => {
  try {
    if (await exists(path)) {
      await unlink(path)
    }
  } catch (e: any) {
    // 画像が残っても印刷には影響しないため、失敗しても止めない
    console.warn('deleteImageFile', e)
  }
}

/**
 * 選んだ画像を、アプリが管理する場所へ複製してそのパスを返す
 *
 * 画像選択で得られるファイルは一時領域にあり、いつ消えるか分からないため、
 * 自分の場所へ持ってくる。
 */
export const copyImageFile = async (
  id: string,
  sourcePath: string,
): Promise<string> => {
  await ensureDirectory()
  const path = imagePath(id)
  await copyFile(sourcePath.replace(/^file:\/\//, ''), path)
  return path
}
