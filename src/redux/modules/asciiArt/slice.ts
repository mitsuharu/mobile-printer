import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice } from '@reduxjs/toolkit'
import { PersistConfig, persistReducer } from 'redux-persist'

export type AsciiArtState = {
  specialDuration: boolean
}

const config: PersistConfig<AsciiArtState> = {
  key: 'AsciiArt',
  version: 1,
  storage: AsyncStorage,
}

const initialState: AsciiArtState = {
  specialDuration: false,
}

const slice = createSlice({
  name: 'AsciiArt',
  initialState,
  reducers: {
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // startReadingNfc(_state, _action: PayloadAction<void>) {},
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // stopReadingNfc(_state, _action: PayloadAction<void>) {},
  },
})

export const {} = slice.actions

export const AsciiArtReducer = persistReducer(config, slice.reducer)
