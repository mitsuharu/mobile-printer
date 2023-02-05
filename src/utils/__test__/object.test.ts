import { isEmpty, hasAnyObject, hasAnyKeyValue } from '../object'

describe('isEmpty', () => {
  beforeEach(async () => {})

  it.each<[input: any | null | undefined, expected: boolean]>([
    [{}, true],
    [{ test: true }, false],
  ])('if input is %s then isEmpty returns %s', (input, expected) => {
    expect(isEmpty(input)).toEqual(expected)
  })
})

describe('hasAnyObject', () => {
  beforeEach(async () => {})

  it.each<[input: any | null | undefined, expected: boolean]>([
    [{}, false],
    [null, false],
    [undefined, false],
    ['test', true],
    [1, true],
    [{ test: true }, true],
  ])('if input is %s then hasAnyObject returns %s', (input, expected) => {
    expect(hasAnyObject(input)).toEqual(expected)
  })
})

describe('hasAnyKeyValue', () => {
  beforeEach(async () => {})

  it.each<[input: any | null | undefined, expected: boolean]>([
    [{}, false],
    [{ key0: undefined }, false],
    [{ key99: 1 }, false],
    [null, false],
    [undefined, false],
    [{ key0: 1 }, true],
    [{ key1: 1 }, true],
    [{ key2: 1 }, true],
    [{ key0: 1, key1: 1 }, true],
    [{ key0: 1, key99: 1 }, true],
  ])('if input is %s then hasAnyKeyValue returns %s', (input, expected) => {
    expect(hasAnyKeyValue(input, ['key0', 'key1', 'key2'])).toEqual(expected)
  })
})
