import type {
  ImageSource,
  Layout,
  LayoutElement,
  LayoutField,
  TextSource,
} from './types'

const touch = (layout: Layout, elements: LayoutElement[]): Layout => ({
  ...layout,
  elements,
})

/**
 * 要素を末尾に足す
 */
export const addElement = (layout: Layout, element: LayoutElement): Layout =>
  touch(layout, [...layout.elements, element])

/**
 * 同じIDの要素を差し替える
 */
export const replaceElement = (
  layout: Layout,
  element: LayoutElement,
): Layout =>
  touch(
    layout,
    layout.elements.map((value) => (value.id === element.id ? element : value)),
  )

/**
 * 要素を取り除く
 */
export const removeElement = (layout: Layout, elementId: string): Layout =>
  touch(
    layout,
    layout.elements.filter(({ id }) => id !== elementId),
  )

/**
 * 要素の位置を入れ替える
 */
export const moveElement = (
  layout: Layout,
  from: number,
  to: number,
): Layout => {
  const { elements } = layout
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= elements.length ||
    to >= elements.length
  ) {
    return layout
  }

  const next = [...elements]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return touch(layout, next)
}

const clearTextSource = (source: TextSource, fieldId: string): TextSource =>
  source.kind === 'field' && source.fieldId === fieldId
    ? { kind: 'static', value: '' }
    : source

const clearImageSource = (source: ImageSource, fieldId: string): ImageSource =>
  source.kind === 'field' && source.fieldId === fieldId
    ? { kind: 'static' }
    : source

/**
 * 入力項目を足すか、同じIDのものを差し替える
 */
export const upsertField = (layout: Layout, field: LayoutField): Layout => {
  const exists = layout.fields.some(({ id }) => id === field.id)
  return {
    ...layout,
    fields: exists
      ? layout.fields.map((value) => (value.id === field.id ? field : value))
      : [...layout.fields, field],
  }
}

/**
 * 入力項目を取り除く
 *
 * 参照している要素は参照先を失うため、あわせて固定値へ戻す。
 */
export const removeField = (layout: Layout, fieldId: string): Layout => ({
  ...layout,
  fields: layout.fields.filter(({ id }) => id !== fieldId),
  elements: layout.elements.map((element) => {
    switch (element.type) {
      case 'text':
      case 'qrcode':
        return { ...element, source: clearTextSource(element.source, fieldId) }
      case 'image':
        return { ...element, source: clearImageSource(element.source, fieldId) }
      case 'columns':
        return {
          ...element,
          columns: element.columns.map((column) => ({
            ...column,
            source: clearTextSource(column.source, fieldId),
          })),
        }
      default:
        return element
    }
  }),
})

/**
 * 入力項目を参照している要素があるか調べる
 */
export const isFieldReferenced = (layout: Layout, fieldId: string): boolean =>
  layout.elements.some((element) => {
    switch (element.type) {
      case 'text':
      case 'qrcode':
      case 'image':
        return (
          element.source.kind === 'field' && element.source.fieldId === fieldId
        )
      case 'columns':
        return element.columns.some(
          ({ source }) => source.kind === 'field' && source.fieldId === fieldId,
        )
      default:
        return false
    }
  })
