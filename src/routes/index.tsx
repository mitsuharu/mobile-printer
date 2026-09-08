import {
  type NavigationAction,
  NavigationContainer,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback } from 'react'
import { StatusBar } from 'react-native'
import { useDispatch } from 'react-redux'
import { GlobalSnackbar } from '@/components/GlobalSnackbar'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import * as NavigationService from '@/utils/NavigationService'
import type { MainParams } from './main.params'
import { RootRoutes } from './root.routes'
import { useAppTheme } from './theme/useAppTheme'
import { describeUnhandledAction } from './unhandledAction'

/**
 * @see https://reactnavigation.org/docs/auth-flow/
 */
const Routes: React.FC = () => {
  const dispatch = useDispatch()
  const { navigationTheme, statusBarStyle } = useAppTheme()

  /**
   * 遷移が処理されなかったことを利用者に知らせる
   *
   * @note
   * 既定では開発ビルドでしか警告が出ず、リリースビルドでは何も起きずに
   * 終わる。押したのに動かない状態を黙って通さないようにする。
   */
  const onUnhandledAction = useCallback(
    (action: NavigationAction) => {
      console.warn('onUnhandledAction', action)
      dispatch(enqueueSnackbar({ message: describeUnhandledAction(action) }))
    },
    [dispatch],
  )

  return (
    <>
      <StatusBar barStyle={statusBarStyle} />
      <NavigationContainer
        theme={navigationTheme}
        ref={NavigationService.navigationRef}
        onUnhandledAction={onUnhandledAction}
      >
        <RootRoutes />
      </NavigationContainer>
      <GlobalSnackbar />
    </>
  )
}

export { Routes }

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainParams {}
  }
}
