import type {
  PrinterInfo,
  PrintImageType,
} from '@mitsuharu/react-native-sunmi-printer-library'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { type PersistConfig, persistReducer } from 'redux-persist'
import { createPresetSubmissions, isEqualToSubmission } from './utils'
import type {
  ImageSource,
  Profile,
  QRCodeSource,
  Submission,
  TextSource,
} from './utils/types'

export type PrinterState = {
  isPrintable: boolean
  printerInfo?: PrinterInfo
  submissions: Submission[]
}

const config: PersistConfig<PrinterState> = {
  key: 'Printer_State',
  version: 1,
  storage: AsyncStorage,
}

const initialState: Readonly<PrinterState> = {
  isPrintable: false,
  printerInfo: undefined,
  submissions: createPresetSubmissions(),
}

const printerSlice = createSlice({
  name: 'PRINTER',
  initialState,
  reducers: {
    assignIsPrintable(state, { payload }: PayloadAction<boolean>) {
      state.isPrintable = payload
    },

    assignPrinterInfo(state, { payload }: PayloadAction<PrinterInfo>) {
      state.printerInfo = payload
    },

    printProfile(_state, _action: PayloadAction<Profile>) {},

    printProfileRandomly(_state, _action: PayloadAction<void>) {},

    printText(_state, _action: PayloadAction<TextSource>) {},

    printImage(_state, _action: PayloadAction<ImageSource>) {},

    printImageFromImagePicker(
      _state,
      _action: PayloadAction<PrintImageType>,
    ) {},

    printQRCode(_state, _action: PayloadAction<QRCodeSource>) {},

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
  assignIsPrintable,
  assignPrinterInfo,
  printProfile,
  printProfileRandomly,
  printText,
  printImage,
  printImageFromImagePicker,
  printQRCode,
  duplicateQRCode,
  saveSubmission,
  deleteSubmission,
} = printerSlice.actions
export const printerReducer = persistReducer(config, printerSlice.reducer)
