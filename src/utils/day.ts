import dayjs from "dayjs"

/**
 * @returns タイムスタンプ YYYY/MM/DD HH:mm を発行する
 */
export const timeStamp = () => dayjs().locale("ja").format('YYYY/MM/DD HH:mm')
