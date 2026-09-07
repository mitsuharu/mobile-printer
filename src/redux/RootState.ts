import type { AsciiArtState } from './modules/asciiArt/slice'
import type { NfcState } from './modules/nfc/slice'
import type { PrinterState } from './modules/printer/slice'
import type { SnackbarState } from './modules/snackbar/slice'
import type { UserSettingState } from './modules/userSetting/slice'

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
