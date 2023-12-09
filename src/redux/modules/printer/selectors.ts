import { RootState } from '@/redux/RootState'
import { Submission } from './utils'
import { PrinterInfo } from '@mitsuharu/react-native-sunmi-printer-library'

export const selectIsPrintable = (state: RootState): boolean =>
  state.printer.isPrintable

export const selectPrinterInfo = (state: RootState): PrinterInfo | undefined =>
  state.printer.printerInfo

export const selectPrinterSubmissions = (state: RootState): Submission[] =>
  state.printer.submissions
