export const RootName = {
  MainRoute: 'MainRoute',
  // SettingRoute: 'SettingRoute',
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type RootName = (typeof RootName)[keyof typeof RootName]
