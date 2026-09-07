import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { type PersistConfig, persistReducer } from 'redux-persist'

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

    updateSeasonalEvent(_state, _payload: PayloadAction<void>) {},

    printAsciiArt(_state, _payload: PayloadAction<void>) {},

    printAsciiArtChristmas(_state, _payload: PayloadAction<void>) {},

    printAsciiArtNewYear(_state, _payload: PayloadAction<void>) {},

    printAsciiArtSnow(_state, _payload: PayloadAction<void>) {},
  },
})

export const {
  assignSeasonalEvent,
  updateSeasonalEvent,
  printAsciiArt,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  printAsciiArtSnow,
} = slice.actions

export const AsciiArtReducer = persistReducer(config, slice.reducer)
