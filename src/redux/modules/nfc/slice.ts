import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PersistConfig, persistReducer } from 'redux-persist'

export type NfcState = {
  isReading: boolean
}

const config: PersistConfig<NfcState> = {
  key: 'NFC',
  version: 1,
  storage: AsyncStorage,
}

const initialState: NfcState = {
  isReading: false,
}

const userSettingSlice = createSlice({
  name: 'NFC',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    startReading(state, _action: PayloadAction<void>) {
      state.isReading = true
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stopReading(state, _action: PayloadAction<void>) {
      state.isReading = false
    },
  },
})

export const { startReading, stopReading } = userSettingSlice.actions

export const NFCReducer = persistReducer(config, userSettingSlice.reducer)
