import type { Submission } from '@/redux/modules/printer/utils'

export type MainParams = {
  Home: undefined
  Form: { submission: Submission }
  Printer: undefined
  LayoutList: undefined
  LayoutEditor: { layoutId: string }
  ElementEditor: { layoutId: string; elementId: string }
  LayoutFields: { layoutId: string }
  LayoutPreview: { layoutId: string; printDataId?: string }
  PrintDataList: { layoutId: string }
  PrintDataForm: { layoutId: string; printDataId: string }
}
