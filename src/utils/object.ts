/**
 * @returns 引き数 obj が空オブジェクトか判定する
 */
export const isEmpty = (obj: any) => !Object.keys(obj).length

/**
 * @returns 引き数 obj が何かしら値を持つ（空オブジェクトではない）か判定する
 */
export const hasAnyObject = <T>(
  obj: T | null | undefined,
): obj is NonNullable<T> => {
  if (obj) {
    return typeof obj === 'object' ? !!Object.keys(obj).length : true
  }
  return false
}

export const hasAnyKeyValue = <T>(
  obj: T | null | undefined,
  keys: (keyof T)[],
): obj is NonNullable<T> => {
  if (obj && typeof obj === 'object') {
    return !!keys.find((key) => (typeof key === 'string' ? !!obj[key] : false))
  }
  return false
}
