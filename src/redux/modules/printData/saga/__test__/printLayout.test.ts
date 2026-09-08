import { describe, it } from '@jest/globals'
import { call } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import type { Layout, PrintData } from '@/print'
import { validatePrinterSaga } from '@/redux/modules/printer/saga/printerSagaUtils'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { RootState } from '@/redux/RootState'
import { printLayout } from '../../slice'
import { printLayoutSaga } from '../printLayout'

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [],
  elements: [
    {
      id: 'text-1',
      type: 'text',
      source: { kind: 'static', value: '織田信長' },
      fontSize: 24,
      bold: false,
      underline: false,
      alignment: 'center',
      hideWhenEmpty: true,
    },
  ],
  createdAt: 0,
  updatedAt: 0,
}

const printData: PrintData = {
  id: 'print-1',
  layoutId: 'layout-1',
  title: 'サンプル',
  values: {},
  createdAt: 0,
  updatedAt: 0,
}

const state = {
  layout: { layouts: [layout], isLoading: false },
  printData: { printData: [printData], isLoading: false },
} as RootState

const action = printLayout({ layoutId: 'layout-1', printDataId: 'print-1' })

const timeoutMessage =
  '印刷が終わりませんでした。プリンターの状態を確認してください'

describe('printLayoutSaga', () => {
  it('印刷が終わったら何も知らせない', () =>
    expectSaga(printLayoutSaga, action)
      .withState(state)
      .provide([
        [call(validatePrinterSaga), true],
        { race: () => ({ done: undefined }) },
      ])
      .not.put(enqueueSnackbar({ message: timeoutMessage }))
      .run())

  /**
   * プリンターが応答しないまま終わらないと、`takeLeading` が以後の印刷を
   * 捨て続ける。時間で切り上げて知らせることを確かめる。
   */
  it('印刷が終わらなければ知らせて、サーガを終わらせる', () =>
    expectSaga(printLayoutSaga, action)
      .withState(state)
      .provide([
        [call(validatePrinterSaga), true],
        { race: () => ({ isTimeout: true }) },
      ])
      .put(enqueueSnackbar({ message: timeoutMessage }))
      .run())

  it('プリンターが使えなければ印刷しない', () =>
    expectSaga(printLayoutSaga, action)
      .withState(state)
      .provide([[call(validatePrinterSaga), false]])
      .not.put(enqueueSnackbar({ message: timeoutMessage }))
      .run())
})
