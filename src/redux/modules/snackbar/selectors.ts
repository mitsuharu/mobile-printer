import { createSelector } from 'reselect'
import type { RootState } from '@/redux/RootState'
import type { SnackbarItem } from './slice'

const selectSnackbarItemQueue = (state: RootState): SnackbarItem[] =>
  state.snackbar.itemQueue

export const selectSnackbarItem = createSelector(
  (state: RootState) => selectSnackbarItemQueue(state),
  (items: SnackbarItem[]) =>
    [...items].sort((a, b) => a.createdAt - b.createdAt)?.[0],
)
