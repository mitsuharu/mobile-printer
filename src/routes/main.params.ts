export type MainParams = {
  Home: undefined
  Printer: undefined
  LayoutList: undefined
  LayoutEditor: { layoutId: string }
  ElementEditor: { layoutId: string; elementId: string }
  LayoutFields: { layoutId: string }
  LayoutPreview: { layoutId: string; printDataId?: string }
  PrintDataList: { layoutId: string }
  PrintDataForm: { layoutId: string; printDataId: string }
  AppInfo: undefined
  Licenses: undefined
  LicenseDetail: { licenseId: string }
}
