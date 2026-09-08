import { describe, expect, it } from '@jest/globals'
import type { NavigationAction } from '@react-navigation/native'
import { describeUnhandledAction } from '../unhandledAction'

const action = (value: unknown) => value as NavigationAction

describe('describeUnhandledAction', () => {
  it('遷移先の画面名を添える', () => {
    expect(
      describeUnhandledAction(
        action({ type: 'NAVIGATE', payload: { name: 'LayoutList' } }),
      ),
    ).toBe('画面を開けませんでした（LayoutList）')
  })

  it('画面名がなければ操作の種類を添える', () => {
    // 戻る操作には遷移先の名前がない
    expect(describeUnhandledAction(action({ type: 'GO_BACK' }))).toBe(
      '画面を移動できませんでした（GO_BACK）',
    )
  })

  it('画面名が空文字なら操作の種類を添える', () => {
    expect(
      describeUnhandledAction(
        action({ type: 'NAVIGATE', payload: { name: '' } }),
      ),
    ).toBe('画面を移動できませんでした（NAVIGATE）')
  })
})
