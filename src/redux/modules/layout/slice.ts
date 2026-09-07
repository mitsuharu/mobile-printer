import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Layout } from '@/print'

export type LayoutState = {
  /**
   * SQLite から読み込んだレイアウト（更新が新しい順）
   *
   * @note
   * 情報源は SQLite で、ここは画面へ供給するための写し。
   * そのため redux-persist の対象にしない。
   */
  layouts: Layout[]
  isLoading: boolean
}

const initialState: Readonly<LayoutState> = {
  layouts: [],
  isLoading: false,
}

const layoutSlice = createSlice({
  name: 'LAYOUT',
  initialState,
  reducers: {
    /**
     * SQLite から読み直す
     */
    fetchLayouts(_state, _action: PayloadAction<void>) {},

    assignIsLoading(state, { payload }: PayloadAction<boolean>) {
      state.isLoading = payload
    },

    assignLayouts(state, { payload }: PayloadAction<Layout[]>) {
      state.layouts = payload
    },

    saveLayout(_state, _action: PayloadAction<Layout>) {},

    duplicateLayout(_state, _action: PayloadAction<Layout>) {},

    deleteLayout(_state, _action: PayloadAction<Layout>) {},
  },
})

export const {
  fetchLayouts,
  assignIsLoading,
  assignLayouts,
  saveLayout,
  duplicateLayout,
  deleteLayout,
} = layoutSlice.actions
export const layoutReducer = layoutSlice.reducer
