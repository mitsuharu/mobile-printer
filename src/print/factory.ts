import dayjs from 'dayjs'
import { FONT_SIZE } from '@/CONSTANTS'
import { createUUID } from '@/utils/uuid'
import type {
  Layout,
  LayoutElement,
  LayoutElementType,
  LayoutField,
  PrintData,
} from './types'

/**
 * タイムスタンプ要素の既定の書式
 */
export const DEFAULT_TIMESTAMP_FORMAT = 'YYYY/MM/DD HH:mm'

/**
 * 画像要素の既定の印刷幅
 */
export const DEFAULT_IMAGE_WIDTH = 200

/**
 * 追加した直後の要素を作る
 */
export const createLayoutElement = (type: LayoutElementType): LayoutElement => {
  const id = createUUID()

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        source: { kind: 'static', value: '' },
        fontSize: FONT_SIZE.DEFAULT,
        bold: false,
        underline: false,
        alignment: 'center',
        hideWhenEmpty: true,
      }
    case 'image':
      return {
        id,
        type: 'image',
        source: { kind: 'field', fieldId: '' },
        width: DEFAULT_IMAGE_WIDTH,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      }
    case 'qrcode':
      return {
        id,
        type: 'qrcode',
        source: { kind: 'static', value: '' },
        moduleSize: 8,
        errorLevel: 'low',
        alignment: 'center',
        hideWhenEmpty: true,
      }
    case 'columns':
      return {
        id,
        type: 'columns',
        columns: [
          {
            source: { kind: 'static', value: '' },
            width: 10,
            alignment: 'left',
          },
          {
            source: { kind: 'static', value: '' },
            width: 22,
            alignment: 'left',
          },
        ],
        hideWhenEmpty: true,
      }
    case 'divider':
      return { id, type: 'divider', barType: 'line' }
    case 'spacer':
      return { id, type: 'spacer', lines: 1 }
    case 'timestamp':
      return {
        id,
        type: 'timestamp',
        format: DEFAULT_TIMESTAMP_FORMAT,
        alignment: 'right',
      }
  }
}

/**
 * 差し込み口を作る
 */
export const createLayoutField = (
  values: Partial<Omit<LayoutField, 'id'>> = {},
): LayoutField => ({
  id: createUUID(),
  key: '',
  label: '',
  valueType: 'text',
  ...values,
})

/**
 * 新規レイアウトを作る
 *
 * 初期状態はテキスト要素ひとつだけとする。
 */
export const createLayout = (name = ''): Layout => {
  const now = dayjs().valueOf()
  return {
    id: createUUID(),
    name,
    fields: [],
    elements: [createLayoutElement('text')],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * レイアウトに紐づく新規の印刷データを作る
 */
export const createPrintData = (layoutId: string, title = ''): PrintData => {
  const now = dayjs().valueOf()
  return {
    id: createUUID(),
    layoutId,
    title,
    values: {},
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * レイアウトを複製する
 *
 * 要素とフィールドは新しいIDを振り直し、要素からのフィールド参照も付け替える。
 */
export const duplicateLayout = (layout: Layout, name: string): Layout => {
  const now = dayjs().valueOf()
  const fieldIdMap = new Map(
    layout.fields.map((field) => [field.id, createUUID()]),
  )
  const nextFieldId = (fieldId: string) => fieldIdMap.get(fieldId) ?? fieldId

  return {
    id: createUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    fields: layout.fields.map((field) => ({
      ...field,
      id: nextFieldId(field.id),
    })),
    elements: layout.elements.map((element) => {
      const id = createUUID()
      switch (element.type) {
        case 'text':
        case 'qrcode':
        case 'image':
          return element.source.kind === 'field'
            ? {
                ...element,
                id,
                source: {
                  ...element.source,
                  fieldId: nextFieldId(element.source.fieldId),
                },
              }
            : { ...element, id }
        case 'columns':
          return {
            ...element,
            id,
            columns: element.columns.map((column) =>
              column.source.kind === 'field'
                ? {
                    ...column,
                    source: {
                      ...column.source,
                      fieldId: nextFieldId(column.source.fieldId),
                    },
                  }
                : column,
            ),
          }
        default:
          return { ...element, id }
      }
    }),
  }
}
