import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type DatabaseState = {
  /**
   * マイグレーションまで完了して、読み書きできる状態か
   */
  isReady: boolean
}

const initialState: Readonly<DatabaseState> = {
  isReady: false,
}

const databaseSlice = createSlice({
  name: 'DATABASE',
  initialState,
  reducers: {
    assignIsReady(state, { payload }: PayloadAction<boolean>) {
      state.isReady = payload
    },
  },
})

export const { assignIsReady } = databaseSlice.actions
export const databaseReducer = databaseSlice.reducer
