import { RootState } from '@/redux/RootState'
import { Submission } from './utils'

export const selectPrinterSubmissions = (state: RootState): Submission[] =>
  state.printer.submissions
