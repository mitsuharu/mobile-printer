export const MainName = {
  Home: 'Home',
  Form: 'Form',
  Printer: 'Printer',
  LayoutList: 'LayoutList',
  LayoutEditor: 'LayoutEditor',
  ElementEditor: 'ElementEditor',
  LayoutFields: 'LayoutFields',
  LayoutPreview: 'LayoutPreview',
} as const

export type MainName = (typeof MainName)[keyof typeof MainName]
