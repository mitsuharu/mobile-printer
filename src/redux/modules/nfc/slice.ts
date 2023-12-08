import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PersistConfig, persistReducer } from 'redux-persist'

export type NfcState = {
  isSupported: boolean
  isReading: boolean
}

const config: PersistConfig<NfcState> = {
  key: 'NFC',
  version: 1,
  storage: AsyncStorage,
}

const initialState: NfcState = {
  isSupported: false,
  isReading: false,
}

const userSettingSlice = createSlice({
  name: 'NFC',
  initialState,
  reducers: {
    assignNfcIsSupported(state, { payload }: PayloadAction<boolean>) {
      state.isSupported = payload
    },

    assignNfcIsReading(state, { payload }: PayloadAction<boolean>) {
      state.isReading = payload
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    startReadingNfc(_state, _action: PayloadAction<void>) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stopReadingNfc(_state, _action: PayloadAction<void>) {},
  },
})

export const {
  assignNfcIsSupported,
  assignNfcIsReading,
  startReadingNfc,
  stopReadingNfc,
} = userSettingSlice.actions

export const NFCReducer = persistReducer(config, userSettingSlice.reducer)
