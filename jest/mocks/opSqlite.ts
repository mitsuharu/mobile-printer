/**
 * `@op-engineering/op-sqlite` のテスト用モック
 *
 * 本体は読み込み時に `NativeModules.OPSQLite` へアクセスするため、
 * Jest ではネイティブへ触らないこのモジュールへ差し替える。
 * データベースを伴う検証は `SqliteConnection` を差し替えて行う。
 */
export const open = () => {
  throw new Error('op-sqlite is not available in tests')
}

export const openSync = open
export const openAsync = open
export const openRemote = open

export const IOS_DOCUMENT_PATH = ''
export const IOS_LIBRARY_PATH = ''
export const ANDROID_DATABASE_PATH = ''
export const ANDROID_FILES_PATH = ''
export const ANDROID_EXTERNAL_FILES_PATH = ''
