import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { isEqualToSubmission, Profile, Submission } from './utils/types'

export type PrinterState = {
  submissions: Submission[]
}

const initialState: Readonly<PrinterState> = {
  submissions: [],
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
  },
})

export const { print } = printerSlice.actions
export const printerReducer = printerSlice.reducer
