import { createSelector } from 'reselect'
import type { Layout } from '@/print'
import type { RootState } from '@/redux/RootState'

export const selectLayouts = (state: RootState): Layout[] =>
  state.layout.layouts

export const selectLayoutIsLoading = (state: RootState): boolean =>
  state.layout.isLoading

export const selectLayoutById = (id: string | undefined) =>
  createSelector(selectLayouts, (layouts) =>
    id ? layouts.find((layout) => layout.id === id) : undefined,
  )
