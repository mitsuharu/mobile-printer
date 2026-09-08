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
        label: trimmed || '入力項目',
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
          dialogDescription="改行して複数行にできます"
          multiline={true}
          onChange={(value) => onChange({ kind: 'static', value })}
        />
      ) : (
        <PickerCell
          title="入力項目"
          description="印刷データごとに入力する箇所です"
          value={source.fieldId}
          items={layout.fields.map((field) => ({
            value: field.id,
            title: field.label || field.key,
            description: field.key,
          }))}
          action={{
            title: '入力項目を追加する',
            description: 'このレイアウトに新しい入力欄を作ります',
            onPress: () => setIsDialogVisible(true),
          }}
          onChange={(fieldId) => onChange({ kind: 'field', fieldId })}
        />
      )}
      <InputDialog
        isVisible={isDialogVisible}
        title="入力項目の追加"
        description="表示名を入力してください"
        onPress={onSubmitNewField}
        onCancel={() => setIsDialogVisible(false)}
      />
    </Section>
  )
}
