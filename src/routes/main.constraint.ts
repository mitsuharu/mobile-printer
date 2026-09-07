export const MainName = {
  Home: 'Home',
  Printer: 'Printer',
  LayoutList: 'LayoutList',
  LayoutEditor: 'LayoutEditor',
  ElementEditor: 'ElementEditor',
  LayoutFields: 'LayoutFields',
  LayoutPreview: 'LayoutPreview',
  PrintDataList: 'PrintDataList',
  PrintDataForm: 'PrintDataForm',
} as const

export type MainName = (typeof MainName)[keyof typeof MainName]
