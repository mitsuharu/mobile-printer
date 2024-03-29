import { RootState } from '@/redux/RootState'

export const selectNfcIsSupported = (state: RootState): boolean =>
  state.nfc.isSupported

export const selectNfcIsReading = (state: RootState): boolean =>
  state.nfc.isReading
