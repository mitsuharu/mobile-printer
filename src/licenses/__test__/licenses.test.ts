import { describe, expect, it } from '@jest/globals'
import packageJson from '../../../package.json'
import { findOssLicense, ossLicenseId, ossLicenses } from '..'

/**
 * ライセンス一覧は scripts/generateLicenses.mjs が生成する。
 * 依存パッケージを足したり外したりしたあとに作り直し忘れると、
 * ここで気付けるようにしている。
 */
describe('ossLicenses', () => {
  it('ライセンス一覧を持つ', () => {
    expect(ossLicenses.length).toBeGreaterThan(0)
  })

  it('package.json の dependencies をすべて含む', () => {
    const names = new Set(ossLicenses.map(({ name }) => name))
    const missing = Object.keys(packageJson.dependencies).filter(
      (name) => !names.has(name),
    )

    expect(missing).toEqual([])
  })

  it('devDependencies だけのパッケージは含まない', () => {
    // 実行時に同梱しないものまで並べると、利用者に誤った情報を見せてしまう
    const names = new Set(ossLicenses.map(({ name }) => name))
    expect(names.has('@biomejs/biome')).toBe(false)
    expect(names.has('jest')).toBe(false)
  })

  it('パッケージ名とバージョンの組は重複しない', () => {
    const ids = ossLicenses.map(ossLicenseId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('すべてのパッケージがライセンス名を持つ', () => {
    const unknown = ossLicenses.filter(
      ({ license }) => license === '' || license === 'UNKNOWN',
    )
    expect(unknown.map(ossLicenseId)).toEqual([])
  })

  it('IDから引ける', () => {
    const [first] = ossLicenses
    expect(findOssLicense(ossLicenseId(first))).toEqual(first)
  })
})
