export const RootName = {
  MainRoute: 'MainRoute',
  // SettingRoute: 'SettingRoute',
} as const

export type RootName = (typeof RootName)[keyof typeof RootName]
