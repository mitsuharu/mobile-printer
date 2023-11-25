import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { createPresetSubmissions, isEqualToSubmission } from './utils'
import {
  ImageSource,
  Profile,
  QRCodeSource,
  Submission,
  TextSource,
} from './utils/types'
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
    printProfile(_state, _action: PayloadAction<Profile>) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    printText(_state, _action: PayloadAction<TextSource>) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    printImage(_state, _action: PayloadAction<ImageSource>) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    printImageFromImagePicker(_state, _action: PayloadAction<void>) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    printQRCode(_state, _action: PayloadAction<QRCodeSource>) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    duplicateQRCode(_state, _action: PayloadAction<void>) {},

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

export const {
  printProfile,
  printText,
  printImage,
  printImageFromImagePicker,
  printQRCode,
  duplicateQRCode,
  saveSubmission,
  deleteSubmission,
} = printerSlice.actions
export const printerReducer = persistReducer(config, printerSlice.reducer)
