export const MainName = {
  Home: 'Home',
  Form: 'Form',
  Printer: 'Printer',
} as const

export type MainName = (typeof MainName)[keyof typeof MainName]
