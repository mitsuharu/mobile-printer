import { PrinterState } from './modules/printer/slice'
import { SnackbarState } from './modules/snackbar/slice'
import { UserSettingState } from './modules/userSetting/slice'

export interface RootState {
  printer: PrinterState
  snackbar: SnackbarState
  userSetting: UserSettingState
}

// typescript definition
// see: https://qiita.com/Takepepe/items/6addcb1b0facb8c6ff1f
declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends RootState {}
}
