export const MainName = {
  Home: 'Home',
  Form: 'Form',
  Printer: 'Printer',
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type MainName = (typeof MainName)[keyof typeof MainName]
