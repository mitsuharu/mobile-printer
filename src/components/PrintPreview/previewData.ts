import type { Layout, PrintData } from '@/print'

/**
 * プレビュー用に、入力項目へ仮の値を入れた印刷データを作る
 *
 * 実際の印刷データがない状態では入力項目が空になり、`hideWhenEmpty` の要素が
 * すべて消えて体裁を確かめられない。表示名を仮の値として入れておく。
 */
export const createPreviewPrintData = (layout: Layout): PrintData => ({
  id: 'preview',
  layoutId: layout.id,
  title: 'プレビュー',
  values: Object.fromEntries(
    layout.fields
      .filter(({ valueType }) => valueType !== 'image')
      .map((field) => [
        field.id,
        { kind: 'text' as const, value: `［${field.label || field.key}］` },
      ]),
  ),
  createdAt: 0,
  updatedAt: 0,
})
