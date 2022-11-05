import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { createPresetSubmissions, isEqualToSubmission } from './utils'
import { Profile, Submission } from './utils/types'
import { PersistConfig, persistReducer } from 'redux-persist'

export type PrinterState = {
  submissions: Submission[]
}

const config: PersistConfig<PrinterState> = {
  key: 'Printer_State',
  version: 1,
  storage: AsyncStorage,
}

const initialState: Readonly<PrinterState> = {
  submissions: createPresetSubmissions(),
}

const printerSlice = createSlice({
  name: 'PRINTER',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    print(_state, _action: PayloadAction<Profile>) {},

    saveSubmission(state, { payload }: PayloadAction<Submission>) {
      const index = state.submissions.findIndex((obj) =>
        isEqualToSubmission(obj, payload),
      )
      const nextValue = { ...payload, updatedAt: dayjs().valueOf() }
      if (index >= 0) {
        state.submissions[index] = nextValue
      } else {
        state.submissions.push(nextValue)
      }
    },

    deleteSubmission(state, { payload }: PayloadAction<Submission>) {
      const newSubmissions = state.submissions.filter(
        (obj) => !isEqualToSubmission(obj, payload),
      )
      state.submissions = newSubmissions
    },
  },
})

export const { print, saveSubmission, deleteSubmission } = printerSlice.actions
export const printerReducer = persistReducer(config, printerSlice.reducer)
