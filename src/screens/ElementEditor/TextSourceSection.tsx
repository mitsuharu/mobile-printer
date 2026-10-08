import type React from 'react'
import { useCallback, useState } from 'react'
import { InputDialog } from '@/components/Dialog'
import { Section } from '@/components/List'
import type { Layout, LayoutField, TextSource } from '@/print'
import { createLayoutField } from '@/print'
import { PickerCell, TextValueCell } from './rows'

type Props = {
  title: string
  layout: Layout
  source: TextSource

  /**
   * 供給元を変える
   *
   * その場で作った入力項目は、要素の変更と一緒に保存するため `field` で渡す。
   */
  onChange: (source: TextSource, field?: LayoutField) => void
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
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  const onSubmitNewField = useCallback(
    (label: string) => {
      setIsDialogVisible(false)
      const trimmed = label.trim()
      const field = createLayoutField({
        label: trimmed || 'Input fields',
        key: trimmed || `field${layout.fields.length + 1}`,
      })
      onChange({ kind: 'field', fieldId: field.id }, field)
    },
    [layout.fields.length, onChange],
  )

  const onChangeKind = useCallback(
    (kind: SourceKind) => {
      if (kind === source.kind) {
        return
      }
      // 入力項目が1つも無いまま選ぶと、どこも指す先のない参照ができてしまう。
      // 先に入力項目を作らせてから結びつける。
      if (kind === 'field' && layout.fields.length === 0) {
        setIsDialogVisible(true)
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
        title="Content source"
        value={source.kind}
        items={[
          {
            value: 'static' as SourceKind,
            title: 'Use fixed text',
            description: 'Use the same text for every print record',
          },
          {
            value: 'field' as SourceKind,
            title: 'Use an input field',
            description: 'Enter different content for each print record',
          },
        ]}
        onChange={onChangeKind}
      />
      {source.kind === 'static' ? (
        <TextValueCell
          title="Content"
          value={source.value}
          dialogDescription="Use line breaks for multiline text"
          multiline={true}
          onChange={(value) => onChange({ kind: 'static', value })}
        />
      ) : (
        <PickerCell
          title="Input fields"
          description="Fields whose content can vary between print records"
          value={source.fieldId}
          items={layout.fields.map((field) => ({
            value: field.id,
            title: field.label || field.key,
            description: field.key,
          }))}
          action={{
            title: 'Add an input field',
            description: 'Create a new input field in this layout',
            onPress: () => setIsDialogVisible(true),
          }}
          onChange={(fieldId) => onChange({ kind: 'field', fieldId })}
        />
      )}
      <InputDialog
        isVisible={isDialogVisible}
        title="Add input field"
        description="Enter a display name"
        onPress={onSubmitNewField}
        onCancel={() => setIsDialogVisible(false)}
      />
    </Section>
  )
}
