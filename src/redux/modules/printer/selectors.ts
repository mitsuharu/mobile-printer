import { RootState } from '@/redux/RootState'
import { Submission } from './utils'

export const selectIsPrintable = (state: RootState): boolean =>
  state.printer.isPrintable

export const selectPrinterSubmissions = (state: RootState): Submission[] =>
  state.printer.submissions
