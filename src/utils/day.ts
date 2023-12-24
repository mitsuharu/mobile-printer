import dayjs from 'dayjs'

/**
 * @returns タイムスタンプ YYYY/MM/DD HH:mm を発行する
 */
export const timeStamp = () => dayjs().locale('ja').format('YYYY/MM/DD HH:mm')

/**
 * 引数のunix時間（ミリ秒）と今を比較して、日付が変わったか判定する
 */
export const isMoreThanOneDay = (milliUnixTime: number) => {
  const compared = dayjs(milliUnixTime).startOf('day')
  const current = dayjs().startOf('day')
  const diff = current.diff(compared, 'day')
  return diff > 0
}

/**
 * 今日がクリスマス期間か調べる
 */
export const isChristmasDuration = () => {
  const year = dayjs().locale('ja').year()
  const startDay = `${year}-12-24`
  const endDay = `${year}-12-25`
  return dayjs()
    .locale('ja')
    .startOf('day')
    .isBetween(startDay, endDay, null, '[]')
}

/**
 * 今日が正月期間か調べる
 */
export const isNewYearDuration = () => {
  const year = dayjs().locale('ja').year()
  const startDay = `${year}-01-01`
  const endDay = `${year}-01-03`
  return dayjs()
    .locale('ja')
    .startOf('day')
    .isBetween(startDay, endDay, null, '[]')
}
