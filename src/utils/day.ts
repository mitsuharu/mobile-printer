import dayjs from 'dayjs'

/**
 * @returns タイムスタンプ YYYY/MM/DD HH:mm を発行する
 */
export const timeStamp = () => dayjs().locale('ja').format('YYYY/MM/DD HH:mm')

/**
 * @returns 引数のunix時間（ミリ秒）を YYYY/MM/DD HH:mm で表示する
 */
export const formatDateTime = (milliUnixTime: number) =>
  dayjs(milliUnixTime).locale('ja').format('YYYY/MM/DD HH:mm')
