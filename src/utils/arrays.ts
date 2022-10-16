import { Falsy } from 'react-native'

/**
 * @example
 * const nonNulls = nullables.filter(nonNull)
 */
export function nonNull<T>(item: T | null | undefined): item is T {
  return item !== null && item !== undefined
}

/**
 * @example
 * const nonFalsies = maybeFalsies.filter(nonFalsy)
 */
export function nonFalsy<T>(item: T | Falsy): item is T {
  return !!item
}

/**
 * 非同期な filter 関数。
 * - 配列の関数ではなく、関数に配列を与える
 *
 * @ref https://qiita.com/hnw/items/f104a1079906fc5c2a96
 */
export const asyncFilter = async <T>(
  array: T[],
  asyncCallback: (arg: T) => Promise<boolean>,
): Promise<T[]> => {
  const bits = await Promise.all(array.map(asyncCallback))
  return array.filter((_, index) => bits[index])
}

/**
 * 配列から、ユニークな（重複しない）配列を生成する
 *
 * @description
 * keyが未指定の場合、[...new Set(args)] の方が早そうだが、実際は遅かった。
 * なお、jsのSetは順番が保証されている
 */
const _uniqueBy = <T>(args: T[], key?: keyof T): T[] => {
  const valueSet = new Set()
  return args.filter((arg) => {
    const value = key ? arg[key] : arg
    if (valueSet.has(value)) {
      return false
    }
    valueSet.add(value)
    return true
  })
}

/**
 * 単純な配列から、ユニークな（重複しない）配列を生成する
 * - 単純比較できる string[] や number[] など
 */
export const unique = <T>(args: T[]): T[] => _uniqueBy(args)

/**
 * 配列から、その配列内要素の特定keyを基準に、ユニークな（重複しない）配列を生成する
 *
 * @example
 * const uniqueArray = uniqueBy([{x:1}, {x:1}, {x:2}], 'x')
 */
export const uniqueBy = <T>(args: T[], key: keyof T): T[] =>
  _uniqueBy(args, key)

/**
 * 引数で与えた数値 n から配列 [0, 1, 2, ..., n - 1] を生成する
 *
 * @param n 1以上の整数。
 *
 * @exception 引数に0、負の値、整数以外の実数をしているとエラーを返す。
 *
 * @example
 * const array = makeSteppedArray(5)
 * // array = [0, 1, 2, 3, 4]
 */
export const makeSteppedArray = (n: number) => {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error(
      `Argument of makeSteppedArray must be a positive integer. But, You set ${n}.`,
    )
  }
  return [...Array(n)].map((_, i) => i)
}

/**
 * 任意な配列を一定の個数ごとに分割する
 *
 * @param array 任意な1次元の配列
 * @param size 正の整数
 *
 * @throw
 * size は正の整数でなければならない
 *
 * @example
 * const result = chunk([0, 1, 2, 3, 4], 2)
 * // result = [[0, 1], [2, 3], [4]]
 */
export const chunk = <T extends any[]>(array: T, size: number): T[] => {
  if (Number.isInteger(size) && size > 0) {
    return array.reduce(
      (acc, _, i) => (i % size ? acc : [...acc, array.slice(i, i + size)]),
      [] as T[],
    )
  }
  throw new Error(
    `Argument "size" must be a positive integer. But, You set ${size}.`,
  )
}
