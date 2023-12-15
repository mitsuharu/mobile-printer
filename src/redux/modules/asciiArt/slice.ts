import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { PersistConfig, persistReducer } from 'redux-persist'

export type SeasonalEvent = 'none' | 'christmas' | 'newYear'

export type AsciiArtState = {
  seasonalEvent: SeasonalEvent
  updatedAt: number
}

const config: PersistConfig<AsciiArtState> = {
  key: 'AsciiArt',
  version: 1,
  storage: AsyncStorage,
}

const initialState: AsciiArtState = {
  seasonalEvent: 'none',
  updatedAt: 0,
}

const slice = createSlice({
  name: 'AsciiArt',
  initialState,
  reducers: {
    assignSeasonalEvent(state, { payload }: PayloadAction<SeasonalEvent>) {
      state.seasonalEvent = payload
      state.updatedAt = dayjs().valueOf()
    },
  },
})

export const { assignSeasonalEvent } = slice.actions

export const AsciiArtReducer = persistReducer(config, slice.reducer)
