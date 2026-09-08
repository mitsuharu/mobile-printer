import { describe, expect, it } from '@jest/globals'
import { makeStatusBarStyle } from '../statusBarStyle'

describe('makeStatusBarStyle', () => {
  it('明るい配色では濃い色で描く', () => {
    expect(makeStatusBarStyle('light')).toBe('dark-content')
  })

  it('暗い配色では白で描く', () => {
    expect(makeStatusBarStyle('dark')).toBe('light-content')
  })

  it('配色が分からないときは明るい配色として扱う', () => {
    // 端末の設定を読めないときも、既定の見た目は明るい配色になる
    expect(makeStatusBarStyle(null)).toBe('dark-content')
  })
})
