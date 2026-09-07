import type {
  PrinterInfo,
  PrintImageType,
} from '@mitsuharu/react-native-sunmi-printer-library'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type PersistConfig, persistReducer } from 'redux-persist'
import type { ImageSource, QRCodeSource, TextSource } from './utils/types'

export type PrinterState = {
  isPrintable: boolean
  printerInfo?: PrinterInfo
}

const config: PersistConfig<PrinterState> = {
  key: 'Printer_State',
  // プロフィール印刷の廃止で保存する内容が変わったため、版を上げて作り直す
  version: 2,
  storage: AsyncStorage,
}

const initialState: Readonly<PrinterState> = {
  isPrintable: false,
  printerInfo: undefined,
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

    printText(_state, _action: PayloadAction<TextSource>) {},

    printImage(_state, _action: PayloadAction<ImageSource>) {},

    printImageFromImagePicker(
      _state,
      _action: PayloadAction<PrintImageType>,
    ) {},

    printQRCode(_state, _action: PayloadAction<QRCodeSource>) {},

    duplicateQRCode(_state, _action: PayloadAction<void>) {},
  },
})

export const {
  assignIsPrintable,
  assignPrinterInfo,
  printText,
  printImage,
  printImageFromImagePicker,
  printQRCode,
  duplicateQRCode,
} = printerSlice.actions
export const printerReducer = persistReducer(config, printerSlice.reducer)
