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

    /**
     * レイアウトを印刷する
     *
     * `printDataId` を省略すると、差し込みのない要素だけが印刷される。
     */
    printLayout(
      _state,
      _action: PayloadAction<{ layoutId: string; printDataId?: string }>,
    ) {},
  },
})

export const {
  fetchPrintData,
  assignIsLoading,
  assignPrintData,
  savePrintData,
  duplicatePrintData,
  deletePrintData,
  printLayout,
} = printDataSlice.actions
export const printDataReducer = printDataSlice.reducer
