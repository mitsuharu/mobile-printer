import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Profile } from './utils'

export type PrinterState = {}

const initialState: Readonly<PrinterState> = {}

const printerSlice = createSlice({
  name: 'PRINTER',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    print(_state, _action: PayloadAction<Profile>) {},
  },
})

export const { print } = printerSlice.actions
export const printerReducer = printerSlice.reducer
