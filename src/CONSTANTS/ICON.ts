/**
 * レイアウトと印刷データを見分けるためのアイコン
 *
 * @note
 * 一覧のセルはどれも同じ形をしているため、いま見ているのがレイアウトなのか
 * 印刷データなのかを、文字を読む前に見分けられるようにする。
 * 値は `react-native-vector-icons/AntDesign` のアイコン名。
 */
export const ICON = {
  /**
   * 印刷の体裁
   */
  LAYOUT: 'layout',

  /**
   * 体裁へ入れる内容
   */
  PRINT_DATA: 'filetext1',
} as const
