import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type PersistConfig, persistReducer } from 'redux-persist'

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

const slice = createSlice({
  name: 'NFC',
  initialState,
  reducers: {
    assignNfcIsSupported(state, { payload }: PayloadAction<boolean>) {
      state.isSupported = payload
    },

    assignNfcIsReading(state, { payload }: PayloadAction<boolean>) {
      state.isReading = payload
    },

    startReadingNfc(_state, _action: PayloadAction<void>) {},

    stopReadingNfc(_state, _action: PayloadAction<void>) {},
  },
})

export const {
  assignNfcIsSupported,
  assignNfcIsReading,
  startReadingNfc,
  stopReadingNfc,
} = slice.actions

export const NFCReducer = persistReducer(config, slice.reducer)
