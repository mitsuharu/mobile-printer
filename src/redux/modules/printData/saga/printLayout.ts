import { call, delay, put, race, select } from 'redux-saga/effects'
import type { Layout, PrintCommand, PrintData } from '@/print'
import { buildPrintCommands, executePrintCommands } from '@/print'
import { selectLayouts } from '@/redux/modules/layout/selectors'
import { validatePrinterSaga } from '@/redux/modules/printer/saga/printerSagaUtils'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { selectAllPrintData } from '../selectors'
import type { printLayout } from '../slice'

/**
 * 印刷の実行を待つ上限（ミリ秒）
 *
 * @note
 * プリンターは、バッファへ入ったあとに応答が返らないと固まることがある
 * （`executePrintCommands` の注記を参照）。`printLayout` は `takeLeading`
 * で受けているため、このサーガが終わらないと以後の印刷が黙って捨てられ、
 * アプリを再起動するまで印刷できなくなる。時間で切り上げて次を受け付ける。
 */
const PRINT_TIMEOUT = 15000

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

    const { isTimeout }: { isTimeout?: true } = yield race({
      done: call(executePrintCommands, commands),
      isTimeout: delay(PRINT_TIMEOUT),
    })
    if (isTimeout) {
      yield put(
        enqueueSnackbar({
          message: `印刷が終わりませんでした。プリンターの状態を確認してください`,
        }),
      )
    }
  } catch (e: any) {
    console.warn('printLayoutSaga', e)
    yield put(enqueueSnackbar({ message: `印刷に失敗しました` }))
  }
}
