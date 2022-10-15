import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type InAppWebState = {}

const initialState: InAppWebState = {}

const inAppWebSlice = createSlice({
  name: 'IN_APP_WEB_BROWSER',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    openWeb(_state, _action: PayloadAction<string>) {},
  },
})

export const { openWeb } = inAppWebSlice.actions
export const inAppWebReducer = inAppWebSlice.reducer
