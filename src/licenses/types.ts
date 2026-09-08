/**
 * アプリに同梱している OSS のライセンス情報
 *
 * scripts/generateLicenses.mjs が node_modules から集めて
 * src/assets/licenses.json へ書き出す。
 */
export type OssLicense = {
  name: string
  version: string

  /**
   * SPDX のライセンス識別子。package.json の表記をそのまま持つ。
   */
  license: string

  author?: string
  homepage?: string

  /**
   * LICENSE ファイルの本文。同梱していないパッケージでは undefined になる。
   */
  licenseText?: string
}
