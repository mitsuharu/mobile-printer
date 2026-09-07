import type { AsciiArtState } from './modules/asciiArt/slice'
import type { DatabaseState } from './modules/database/slice'
import type { LayoutState } from './modules/layout/slice'
import type { NfcState } from './modules/nfc/slice'
import type { PrintDataState } from './modules/printData/slice'
import type { PrinterState } from './modules/printer/slice'
import type { SnackbarState } from './modules/snackbar/slice'
import type { UserSettingState } from './modules/userSetting/slice'

export interface RootState {
  database: DatabaseState
  layout: LayoutState
  printData: PrintDataState
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
