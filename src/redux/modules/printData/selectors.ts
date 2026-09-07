import { createSelector } from 'reselect'
import type { PrintData } from '@/print'
import type { RootState } from '@/redux/RootState'

export const selectAllPrintData = (state: RootState): PrintData[] =>
  state.printData.printData

export const selectPrintDataIsLoading = (state: RootState): boolean =>
  state.printData.isLoading

export const selectPrintDataByLayoutId = (layoutId: string | undefined) =>
  createSelector(selectAllPrintData, (values) =>
    layoutId ? values.filter((value) => value.layoutId === layoutId) : [],
  )

export const selectPrintDataById = (id: string | undefined) =>
  createSelector(selectAllPrintData, (values) =>
    id ? values.find((value) => value.id === id) : undefined,
  )
