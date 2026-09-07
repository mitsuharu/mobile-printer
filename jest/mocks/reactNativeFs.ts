/**
 * `react-native-fs` のテスト用モック
 *
 * 本体は読み込み時にネイティブの定数へアクセスするため、Jest では
 * メモリ上の疑似ファイルシステムへ差し替える。
 */
const files = new Map<string, string>()

export const DocumentDirectoryPath = '/documents'

export const exists = async (path: string) =>
  files.has(path) || [...files.keys()].some((key) => key.startsWith(`${path}/`))

export const mkdir = async () => {}

export const writeFile = async (path: string, contents: string) => {
  files.set(path, contents)
}

export const readFile = async (path: string) => {
  const contents = files.get(path)
  if (contents === undefined) {
    throw new Error(`ENOENT: ${path}`)
  }
  return contents
}

export const copyFile = async (from: string, to: string) => {
  files.set(to, files.get(from) ?? '')
}

export const unlink = async (path: string) => {
  files.delete(path)
}

/**
 * テスト用に中身を空にする
 */
export const __reset = () => {
  files.clear()
}

/**
 * テスト用に保存されているパスを見る
 */
export const __paths = () => [...files.keys()]
