export const MainName = {
  Home: 'Home',
  Form: 'Form',
  Printer: 'Printer',
  LayoutList: 'LayoutList',
} as const

export type MainName = (typeof MainName)[keyof typeof MainName]
