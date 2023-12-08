import { RootState } from '@/redux/RootState'

export const selectNfcIsReading = (state: RootState): boolean =>
  state.nfc.isReading
