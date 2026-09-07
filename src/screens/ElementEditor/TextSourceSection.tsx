import type React from 'react'
import { useCallback } from 'react'
import { Cell, Section } from '@/components/List'
import type { Layout, TextSource } from '@/print'
import { PickerCell, TextValueCell } from './rows'

type Props = {
  title: string
  layout: Layout
  source: TextSource
  onChange: (source: TextSource) => void
}

type SourceKind = TextSource['kind']

/**
 * 文字の供給元（レイアウトに固定するか、印刷データごとに入力するか）を編集する
 */
export const TextSourceSection: React.FC<Props> = ({
  title,
  layout,
  source,
  onChange,
}) => {
  const onChangeKind = useCallback(
    (kind: SourceKind) => {
      if (kind === source.kind) {
        return
      }
      onChange(
        kind === 'static'
          ? { kind: 'static', value: '' }
          : { kind: 'field', fieldId: layout.fields[0]?.id ?? '' },
      )
    },
    [layout.fields, onChange, source.kind],
  )

  return (
    <Section title={title}>
      <PickerCell
        title="内容の決め方"
        value={source.kind}
        items={[
          {
            value: 'static' as SourceKind,
            title: 'レイアウトに直接書く',
            description: 'どの印刷データでも同じ内容になります',
          },
          {
            value: 'field' as SourceKind,
            title: '印刷データごとに入力する',
            description: '印刷データごとに内容を変えられます',
          },
        ]}
        onChange={onChangeKind}
      />
      {source.kind === 'static' ? (
        <TextValueCell
          title="内容"
          value={source.value}
          onChange={(value) => onChange({ kind: 'static', value })}
        />
      ) : layout.fields.length === 0 ? (
        <Cell
          title="入力項目がありません"
          description="レイアウトの「入力項目」から追加してください"
          inactive={true}
        />
      ) : (
        <PickerCell
          title="入力項目"
          value={source.fieldId}
          items={layout.fields.map((field) => ({
            value: field.id,
            title: field.label || field.key,
            description: field.key,
          }))}
          onChange={(fieldId) => onChange({ kind: 'field', fieldId })}
        />
      )}
    </Section>
  )
}
