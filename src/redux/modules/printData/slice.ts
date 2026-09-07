import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PrintData } from '@/print'

export type PrintDataState = {
  /**
   * SQLite から読み込んだ印刷データ（更新が新しい順）
   *
   * @note
   * 情報源は SQLite で、ここは画面へ供給するための写し。
   * そのため redux-persist の対象にしない。
   */
  printData: PrintData[]
  isLoading: boolean
}

const initialState: Readonly<PrintDataState> = {
  printData: [],
  isLoading: false,
}

const printDataSlice = createSlice({
  name: 'PRINT_DATA',
  initialState,
  reducers: {
    fetchPrintData(_state, _action: PayloadAction<void>) {},

    assignIsLoading(state, { payload }: PayloadAction<boolean>) {
      state.isLoading = payload
    },

    assignPrintData(state, { payload }: PayloadAction<PrintData[]>) {
      state.printData = payload
    },

    savePrintData(_state, _action: PayloadAction<PrintData>) {},

    duplicatePrintData(_state, _action: PayloadAction<PrintData>) {},

    deletePrintData(_state, _action: PayloadAction<PrintData>) {},
  },
})

export const {
  fetchPrintData,
  assignIsLoading,
  assignPrintData,
  savePrintData,
  duplicatePrintData,
  deletePrintData,
} = printDataSlice.actions
export const printDataReducer = printDataSlice.reducer
