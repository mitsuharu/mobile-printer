import type { NavigationAction } from '@react-navigation/native'

/**
 * 遷移が処理されなかったときに出す文言を作る
 *
 * @note
 * React Native の既定の警告は開発ビルドでしか出ない。リリースビルドでは
 * 何も起きずに終わってしまい、利用者にも開発者にも手がかりが残らない。
 * 画面名まで添えて、どの遷移が捨てられたのかを分かるようにする。
 */
export const describeUnhandledAction = (action: NavigationAction): string => {
  const name = (action.payload as { name?: unknown } | undefined)?.name
  if (typeof name === 'string' && name !== '') {
    return `画面を開けませんでした（${name}）`
  }
  return `画面を移動できませんでした（${action.type}）`
}
