import { call, put, select } from 'redux-saga/effects'
import type { Layout, PrintCommand, PrintData } from '@/print'
import { buildPrintCommands, executePrintCommands } from '@/print'
import { selectLayouts } from '@/redux/modules/layout/selectors'
import { validatePrinterSaga } from '@/redux/modules/printer/saga/printerSagaUtils'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { selectAllPrintData } from '../selectors'
import type { printLayout } from '../slice'

/**
 * @package
 */
export function* printLayoutSaga({ payload }: ReturnType<typeof printLayout>) {
  try {
    const isPrintable: boolean = yield call(validatePrinterSaga)
    if (!isPrintable) {
      return
    }

    const layouts: Layout[] = yield select(selectLayouts)
    const layout = layouts.find(({ id }) => id === payload.layoutId)
    if (!layout) {
      yield put(
        enqueueSnackbar({ message: `レイアウトが見つかりませんでした` }),
      )
      return
    }

    let printData: PrintData | undefined
    if (payload.printDataId) {
      const values: PrintData[] = yield select(selectAllPrintData)
      printData = values.find(({ id }) => id === payload.printDataId)
      if (!printData) {
        yield put(
          enqueueSnackbar({ message: `印刷データが見つかりませんでした` }),
        )
        return
      }
    }

    const commands: PrintCommand[] = yield call(
      buildPrintCommands,
      layout,
      printData,
    )
    if (commands.length === 0) {
      yield put(enqueueSnackbar({ message: `印刷する内容がありません` }))
      return
    }

    yield call(executePrintCommands, commands)
  } catch (e: any) {
    console.warn('printLayoutSaga', e)
    yield put(enqueueSnackbar({ message: `印刷に失敗しました` }))
  }
}
