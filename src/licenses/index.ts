import licenses from '../assets/licenses.json'
import type { OssLicense } from './types'

export type { OssLicense }

/**
 * アプリに同梱している OSS のライセンス一覧
 *
 * @note
 * この一覧は `yarn licenses:generate` が生成する src/assets/licenses.json を読む。
 * 依存パッケージを足したり外したりしたら生成し直すこと。
 */
export const ossLicenses: OssLicense[] = licenses

/**
 * 一覧と詳細でパッケージを指すためのID
 *
 * 同じパッケージの別バージョンが同居することがあるので、名前だけでは足りない。
 */
export const ossLicenseId = ({ name, version }: OssLicense): string =>
  `${name}@${version}`

export const findOssLicense = (id: string): OssLicense | undefined =>
  ossLicenses.find((license) => ossLicenseId(license) === id)
