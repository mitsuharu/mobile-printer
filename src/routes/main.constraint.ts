export const MainName = {
  Home: 'Home',
  Form: 'Form',
  Printer: 'Printer',
  LayoutList: 'LayoutList',
  LayoutEditor: 'LayoutEditor',
} as const

export type MainName = (typeof MainName)[keyof typeof MainName]
