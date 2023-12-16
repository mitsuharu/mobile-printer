import { AsciiArtState } from './modules/asciiArt/slice'
import { NfcState } from './modules/nfc/slice'
import { PrinterState } from './modules/printer/slice'
import { SnackbarState } from './modules/snackbar/slice'
import { UserSettingState } from './modules/userSetting/slice'

export interface RootState {
  printer: PrinterState
  snackbar: SnackbarState
  userSetting: UserSettingState
  nfc: NfcState
  asciiArt: AsciiArtState
}

// typescript definition
// see: https://qiita.com/Takepepe/items/6addcb1b0facb8c6ff1f
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}
