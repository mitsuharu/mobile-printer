import {
  nonNull,
  nonFalsy,
  asyncFilter,
  unique,
  uniqueBy,
  makeSteppedArray,
  chunk,
} from '@/utils/arrays'

describe('nonNull', () => {
  it.each<[array: any[], expected: any[]]>([
    [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ],
    [
      [1, null, 2, undefined, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ],
  ])('%s.filter(nonNull) should return %s', (array, expected) => {
    expect(array.filter(nonNull)).toEqual(expected)
  })
})

describe('nonFalsy', () => {
  it.each<[array: any[], expected: any[]]>([
    [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ],
    [
      [
        1,
        null,
        2,
        undefined,
        0,
        3,
        NaN,
        'a',
        '',
        false,
        true,
        { x: 1 },
        {},
        [],
        ['array'],
      ],
      [1, 2, 3, 'a', true, { x: 1 }, {}, [], ['array']],
    ],
  ])('%s.filter(nonFalsy) should return %s', (array, expected) => {
    expect(array.filter(nonFalsy)).toEqual(expected)
  })
})

describe('asyncFilter', () => {
  it.each<[array: number[], expected: number[]]>([
    [[1, 2, 3, 4, 5], []],
    [
      [11, 2, 13, 4, 15],
      [11, 13, 15],
    ],
  ])('asyncFilter(%s, fn) should return %s', async (array, expected) => {
    const output = await asyncFilter<number>(array, (arg: number) =>
      Promise.resolve(arg > 10),
    )
    expect(output).toEqual(expected)
  })
})

describe('unique', () => {
  it.each<[array: any[], expected: any[]]>([
    [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ],
    [
      [1, 1, 2, 2, 3, 4, 4, 5, 5],
      [1, 2, 3, 4, 5],
    ],
  ])('unique(%s) should return %s', (array, expected) => {
    expect(unique(array)).toEqual(expected)
  })
})

describe('uniqueBy', () => {
  it.each<[array: any[], key: string, expected: any[]]>([
    [
      [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }],
      'x',
      [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }],
    ],
    [
      [
        { x: 1 },
        { x: 1 },
        { x: 2 },
        { x: 2 },
        { x: 3 },
        { x: 3 },
        { x: 4 },
        { x: 4 },
        { x: 5 },
        { x: 5 },
      ],
      'x',
      [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }],
    ],
  ])('uniqueBy(%s, %s) should return %s', (array, key, expected) => {
    expect(uniqueBy(array, key)).toEqual(expected)
  })
})

describe('makeSteppedArray', () => {
  it.each<[input: number, expected: number[]]>([
    [3, [0, 1, 2]],
    [5, [0, 1, 2, 3, 4]],
  ])('makeSteppedArray(%s) should return %s', (input, expected) => {
    expect(makeSteppedArray(input)).toEqual(expected)
  })
  it('catch error)', () => {
    expect(() => {
      makeSteppedArray(0)
    }).toThrow()
    expect(() => {
      makeSteppedArray(1.2)
    }).toThrow()
    expect(() => {
      makeSteppedArray(-100)
    }).toThrow()
  })
})

describe('chunk', () => {
  it.each<[array: any[], size: number, expected: any[][]]>([
    [[1, 2, 3, 4, 5, 6, 7], 3, [[1, 2, 3], [4, 5, 6], [7]]],
    [[1, 2], 2, [[1, 2]]],
    [[1, 2], 3, [[1, 2]]],
    [[1], 1, [[1]]],
    [[], 3, []],
  ])('chunk(%s, %s) should return %s', (array, size, expected) => {
    expect(chunk(array, size)).toEqual(expected)
  })

  it('catch error)', () => {
    expect(() => {
      chunk([], -1)
    }).toThrow()
    expect(() => {
      chunk([], 0)
    }).toThrow()
  })
})
