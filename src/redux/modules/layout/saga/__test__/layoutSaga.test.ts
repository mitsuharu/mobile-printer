import { describe, expect, it, jest } from '@jest/globals'
import { call } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import type { StaticProvider } from 'redux-saga-test-plan/providers'
import * as database from '@/database'
import type { Layout } from '@/print'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import {
  assignIsLoading,
  assignLayouts,
  deleteLayout,
  duplicateLayout,
  fetchLayouts,
  layoutReducer,
  saveLayout,
} from '../../slice'
import { layoutSaga } from '../index'

const layout: Layout = {
  id: 'layout-1',
  name: '名刺',
  fields: [],
  elements: [
    {
      id: 'text-1',
      type: 'text',
      source: { kind: 'static', value: '江本光晴' },
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

const connection = {} as database.SqliteConnection

const provideDatabase = (layouts: Layout[] = [layout]): StaticProvider[] => [
  [call(database.getDatabase), connection],
  [call(database.findAllLayouts, connection), layouts],
]

describe('layoutSaga fetchLayouts', () => {
  it('SQLite から読んだレイアウトを state へ反映する', () =>
    expectSaga(layoutSaga)
      .withReducer(layoutReducer)
      .provide(provideDatabase())
      .put(assignLayouts([layout]))
      .dispatch(fetchLayouts())
      .silentRun()
      .then(({ storeState }) => {
        expect(storeState.layouts).toEqual([layout])
      }))

  it('読み込みの開始と終了を伝える', () =>
    expectSaga(layoutSaga)
      .provide(provideDatabase())
      .put(assignIsLoading(true))
      .put(assignIsLoading(false))
      .dispatch(fetchLayouts())
      .silentRun())

  it('失敗しても読み込み中のままにしない', () =>
    expectSaga(layoutSaga)
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
      .put(enqueueSnackbar({ message: 'レイアウトの読み込みに失敗しました' }))
      .put(assignIsLoading(false))
      .dispatch(fetchLayouts())
      .silentRun())
})

describe('layoutSaga saveLayout', () => {
  it('保存してから読み直す', () => {
    const save = jest.fn()
    return expectSaga(layoutSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn, args }, next) {
            if (fn === database.saveLayout) {
              save(args[1])
              return undefined
            }
            if (fn === database.findAllLayouts) {
              return [layout]
            }
            return next()
          },
        },
      ])
      .put(assignLayouts([layout]))
      .dispatch(saveLayout(layout))
      .silentRun()
      .then(() => {
        expect(save).toHaveBeenCalledWith(layout)
      })
  })

  it('失敗を伝える', () =>
    expectSaga(layoutSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn }, next) {
            if (fn === database.saveLayout) {
              throw new Error('failed')
            }
            return next()
          },
        },
      ])
      .put(enqueueSnackbar({ message: 'レイアウトの保存に失敗しました' }))
      .dispatch(saveLayout(layout))
      .silentRun())
})

describe('layoutSaga duplicateLayout', () => {
  it('コピーであることが分かる名前で保存する', () => {
    const save = jest.fn()
    return expectSaga(layoutSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn, args }, next) {
            if (fn === database.saveLayout) {
              save(args[1])
              return undefined
            }
            if (fn === database.findAllLayouts) {
              return []
            }
            return next()
          },
        },
      ])
      .dispatch(duplicateLayout(layout))
      .silentRun()
      .then(() => {
        const saved = save.mock.calls[0][0] as Layout
        expect(saved.name).toBe('名刺のコピー')
        expect(saved.id).not.toBe(layout.id)
      })
  })
})

describe('layoutSaga deleteLayout', () => {
  it('IDを指定して削除してから読み直す', () => {
    const remove = jest.fn()
    return expectSaga(layoutSaga)
      .provide([
        [call(database.getDatabase), connection],
        {
          call({ fn, args }, next) {
            if (fn === database.deleteLayout) {
              remove(args[1])
              return undefined
            }
            if (fn === database.findAllLayouts) {
              return []
            }
            return next()
          },
        },
      ])
      .put(assignLayouts([]))
      .dispatch(deleteLayout(layout))
      .silentRun()
      .then(() => {
        expect(remove).toHaveBeenCalledWith(layout.id)
      })
  })
})
