import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice } from '@reduxjs/toolkit'
import { PersistConfig, persistReducer } from 'redux-persist'

export type UserSettingState = {
  temp: string
}

const config: PersistConfig<UserSettingState> = {
  key: 'USER_SETTING',
  version: 1,
  storage: AsyncStorage,
}

const initialState: UserSettingState = {
  temp: 'list',
}

const userSettingSlice = createSlice({
  name: 'USER_SETTING',
  initialState,
  reducers: {
    // assignMainType(state, action: PayloadAction<MainType>) {
    //   state.mainType = action.payload
    // },
  },
})

// export const {
// } = userSettingSlice.actions

export const userSettingReducer = persistReducer(
  config,
  userSettingSlice.reducer,
)
