import { isEmpty, hasAnyObject } from '../object'

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
