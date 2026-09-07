import { describe, expect, it, jest } from '@jest/globals'
import { call } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import type { StaticProvider } from 'redux-saga-test-plan/providers'
import * as database from '@/database'
import type { PrintData } from '@/print'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import {
  assignIsLoading,
  assignPrintData,
  deletePrintData,
  duplicatePrintData,
  fetchPrintData,
  printDataReducer,
  savePrintData,
} from '../../slice'
import { printDataSaga } from '../index'

const printData: PrintData = {
  id: 'print-1',
  layoutId: 'layout-1',
  title: '織田信長',
  values: { 'field-1': { kind: 'text', value: '織田信長' } },
  createdAt: 0,
  updatedAt: 0,
}

const connection = {} as database.SqliteConnection

const provideDatabase = (
  values: PrintData[] = [printData],
): StaticProvider[] => [
  [call(database.getDatabase), connection],
  [call(database.findAllPrintData, connection), values],
]

describe('printDataSaga fetchPrintData', () => {
  it('SQLite から読んだ印刷データを state へ反映する', () =>
    expectSaga(printDataSaga)
      .withReducer(printDataReducer)
      .provide(provideDatabase())
      .dispatch(fetchPrintData())
      .silentRun()
      .then(({ storeState }) => {
        expect(storeState.printData).toEqual([printData])
      }))

  it('読み込みの開始と終了を伝える', () =>
    expectSaga(printDataSaga)
      .provide(provideDatabase())
      .put(assignIsLoading(true))
      .put(assignIsLoading(false))
      .dispatch(fetchPrintData())
      .silentRun())

  it('失敗しても読み込み中のままにしない', () =>
    expectSaga(printDataSaga)
      .provide([
        {
          call({ fn }, next) {
            if (fn === database.getDatabase) {
              throw new Error('failed')
            }
            return next()
          },
        },
      ])
      .put(enqueueSnackbar({ message: '印刷データの読み込みに失敗しました' }))
      .put(assignIsLoading(false))
      .dispatch(fetchPrintData())
      .silentRun())
})

describe('printDataSaga savePrintData', () => {
  it('保存してから読み直す', () => {
    const save = jest.fn()
    return expectSaga(printDataSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn, args }, next) {
            if (fn === database.savePrintData) {
              save(args[1])
              return undefined
            }
            if (fn === database.findAllPrintData) {
              return [printData]
            }
            return next()
          },
        },
      ])
      .put(assignPrintData([printData]))
      .dispatch(savePrintData(printData))
      .silentRun()
      .then(() => {
        expect(save).toHaveBeenCalledWith(printData)
      })
  })
})

describe('printDataSaga duplicatePrintData', () => {
  it('コピーであることが分かる名前で、別のIDとして保存する', () => {
    const save = jest.fn()
    return expectSaga(printDataSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn, args }, next) {
            if (fn === database.savePrintData) {
              save(args[1])
              return undefined
            }
            if (fn === database.findAllPrintData) {
              return []
            }
            return next()
          },
        },
      ])
      .dispatch(duplicatePrintData(printData))
      .silentRun()
      .then(() => {
        const saved = save.mock.calls[0][0] as PrintData
        expect(saved.title).toBe('織田信長のコピー')
        expect(saved.id).not.toBe(printData.id)
        expect(saved.values).toEqual(printData.values)
        expect(saved.layoutId).toBe(printData.layoutId)
      })
  })
})

describe('printDataSaga deletePrintData', () => {
  it('IDを指定して削除してから読み直す', () => {
    const remove = jest.fn()
    return expectSaga(printDataSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn, args }, next) {
            if (fn === database.deletePrintData) {
              remove(args[1])
              return undefined
            }
            if (fn === database.findAllPrintData) {
              return []
            }
            return next()
          },
        },
      ])
      .put(assignPrintData([]))
      .dispatch(deletePrintData(printData))
      .silentRun()
      .then(() => {
        expect(remove).toHaveBeenCalledWith(printData.id)
      })
  })
})
