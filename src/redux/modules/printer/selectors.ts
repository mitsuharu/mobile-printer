import type { PrinterInfo } from '@mitsuharu/react-native-sunmi-printer-library'
import type { RootState } from '@/redux/RootState'

export const selectIsPrintable = (state: RootState): boolean =>
  state.printer.isPrintable

export const selectPrinterInfo = (state: RootState): PrinterInfo | undefined =>
  state.printer.printerInfo
