import type {
  ImageAsset,
  ImageSource,
  LayoutColumn,
  LayoutElement,
  LayoutElementType,
  LayoutField,
  TextSource,
} from '@/print'

/**
 * `layout_elements` の1行
 */
export type LayoutElementRow = {
  id: string
  layout_id: string
  sort_order: number
  type: string
  /**
   * 型ごとの体裁の設定（JSON）
   */
  props: string
  /**
   * 内容の供給元（JSON）
   */
  source: string
}

/**
 * `layout_fields` の1行
 */
export type LayoutFieldRow = {
  id: string
  layout_id: string
  key: string
  label: string
  value_type: string
  sort_order: number
}

/**
 * 保存する供給元
 *
 * 固定の画像は本体を持たず、`image_assets` への参照だけを持つ。
 */
type StoredSource =
  | { kind: 'static'; value: string }
  | { kind: 'field'; fieldId: string }
  | { kind: 'staticImage'; assetId?: string }
  | { kind: 'columns'; sources: StoredSource[] }
  | { kind: 'none' }

const elementTypes: LayoutElementType[] = [
  'text',
  'image',
  'qrcode',
  'columns',
  'divider',
  'spacer',
  'timestamp',
]

const isElementType = (value: string): value is LayoutElementType =>
  (elementTypes as string[]).includes(value)

const toStoredTextSource = (source: TextSource): StoredSource => source

const toStoredImageSource = (source: ImageSource): StoredSource =>
  source.kind === 'static'
    ? { kind: 'staticImage', assetId: source.asset?.id }
    : source

const fromStoredTextSource = (source: StoredSource): TextSource => {
  if (source.kind === 'field') {
    return { kind: 'field', fieldId: source.fieldId }
  }
  if (source.kind === 'static') {
    return { kind: 'static', value: source.value }
  }
  return { kind: 'static', value: '' }
}

const fromStoredImageSource = (
  source: StoredSource,
  assets: ReadonlyMap<string, ImageAsset>,
): ImageSource => {
  if (source.kind === 'field') {
    return { kind: 'field', fieldId: source.fieldId }
  }
  if (source.kind === 'staticImage') {
    return {
      kind: 'static',
      asset: source.assetId ? assets.get(source.assetId) : undefined,
    }
  }
  return { kind: 'static' }
}

/**
 * 要素を保存できる形へ変換する
 */
export const serializeElement = (
  element: LayoutElement,
  layoutId: string,
  sortOrder: number,
): LayoutElementRow => {
  const { id, type } = element

  const row = (props: object, source: StoredSource): LayoutElementRow => ({
    id,
    layout_id: layoutId,
    sort_order: sortOrder,
    type,
    props: JSON.stringify(props),
    source: JSON.stringify(source),
  })

  switch (element.type) {
    case 'text':
      return row(
        {
          fontSize: element.fontSize,
          bold: element.bold,
          underline: element.underline,
          alignment: element.alignment,
          hideWhenEmpty: element.hideWhenEmpty,
        },
        toStoredTextSource(element.source),
      )
    case 'image':
      return row(
        {
          width: element.width,
          imageType: element.imageType,
          alignment: element.alignment,
          hideWhenEmpty: element.hideWhenEmpty,
        },
        toStoredImageSource(element.source),
      )
    case 'qrcode':
      return row(
        {
          moduleSize: element.moduleSize,
          errorLevel: element.errorLevel,
          alignment: element.alignment,
          hideWhenEmpty: element.hideWhenEmpty,
        },
        toStoredTextSource(element.source),
      )
    case 'columns':
      return row(
        {
          columns: element.columns.map(({ width, alignment }) => ({
            width,
            alignment,
          })),
          hideWhenEmpty: element.hideWhenEmpty,
        },
        {
          kind: 'columns',
          sources: element.columns.map(({ source }) =>
            toStoredTextSource(source),
          ),
        },
      )
    case 'divider':
      return row({ barType: element.barType }, { kind: 'none' })
    case 'spacer':
      return row({ lines: element.lines }, { kind: 'none' })
    case 'timestamp':
      return row(
        { format: element.format, alignment: element.alignment },
        { kind: 'none' },
      )
  }
}

/**
 * 保存した行から要素へ戻す
 *
 * @throws 未知の要素種別が保存されていた場合
 */
export const deserializeElement = (
  row: LayoutElementRow,
  assets: ReadonlyMap<string, ImageAsset> = new Map(),
): LayoutElement => {
  if (!isElementType(row.type)) {
    throw new Error(`unknown layout element type: ${row.type}`)
  }

  const props = JSON.parse(row.props)
  const source: StoredSource = JSON.parse(row.source)
  const id = row.id

  switch (row.type) {
    case 'text':
      return {
        id,
        type: 'text',
        source: fromStoredTextSource(source),
        ...props,
      }
    case 'image':
      return {
        id,
        type: 'image',
        source: fromStoredImageSource(source, assets),
        ...props,
      }
    case 'qrcode':
      return {
        id,
        type: 'qrcode',
        source: fromStoredTextSource(source),
        ...props,
      }
    case 'columns': {
      const sources = source.kind === 'columns' ? source.sources : []
      const columns: LayoutColumn[] = (
        props.columns as Omit<LayoutColumn, 'source'>[]
      ).map((column, index) => ({
        ...column,
        source: fromStoredTextSource(
          sources[index] ?? { kind: 'static', value: '' },
        ),
      }))
      return {
        id,
        type: 'columns',
        columns,
        hideWhenEmpty: props.hideWhenEmpty,
      }
    }
    case 'divider':
      return { id, type: 'divider', barType: props.barType }
    case 'spacer':
      return { id, type: 'spacer', lines: props.lines }
    case 'timestamp':
      return {
        id,
        type: 'timestamp',
        format: props.format,
        alignment: props.alignment,
      }
  }
}

/**
 * 固定の画像として要素が参照しているアセットのIDを集める
 */
export const collectStaticAssetIds = (elements: LayoutElement[]): string[] => {
  const ids = elements.flatMap((element) =>
    element.type === 'image' &&
    element.source.kind === 'static' &&
    element.source.asset
      ? [element.source.asset.id]
      : [],
  )
  return [...new Set(ids)]
}

export const serializeField = (
  field: LayoutField,
  layoutId: string,
  sortOrder: number,
): LayoutFieldRow => ({
  id: field.id,
  layout_id: layoutId,
  key: field.key,
  label: field.label,
  value_type: field.valueType,
  sort_order: sortOrder,
})

export const deserializeField = (row: LayoutFieldRow): LayoutField => ({
  id: row.id,
  key: row.key,
  label: row.label,
  valueType: row.value_type as LayoutField['valueType'],
})
