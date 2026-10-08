import type React from 'react'
import { useCallback, useState } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { BASE64 } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { ImageFileView } from '@/components/ImageFileView'
import { Section } from '@/components/List'
import type { ImageSource, Layout, LayoutField } from '@/print'
import { createLayoutField } from '@/print'
import { copyImageFile } from '@/utils/imageStore'
import { styleType } from '@/utils/styles'
import { createUUID } from '@/utils/uuid'
import { PickerCell } from './rows'

type Props = {
  layout: Layout
  source: ImageSource
  width: number
  /**
   * 供給元を変える
   *
   * その場で作った入力項目は、要素の変更と一緒に保存するため `field` で渡す。
   */
  onChange: (source: ImageSource, field?: LayoutField) => void
}

type SourceKind = ImageSource['kind']

/**
 * 画像の供給元を編集する
 */
export const ImageSourceSection: React.FC<Props> = ({
  layout,
  source,
  width,
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
        valueType: 'image',
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
          ? { kind: 'static' }
          : { kind: 'field', fieldId: layout.fields[0]?.id ?? '' },
      )
    },
    [layout.fields, onChange, source.kind],
  )

  const onChangeImage = useCallback(
    async (pickedPath: string) => {
      try {
        // 画像を選び直したら別のアセットとして保存する
        const id = createUUID()
        const path = await copyImageFile(id, pickedPath)
        onChange({
          kind: 'static',
          asset: { id, path, width, imageType: 'binary' },
        })
      } catch (e: any) {
        console.warn('onChangeImage', e)
      }
    },
    [onChange, width],
  )

  return (
    <Section title="Content">
      <PickerCell
        title="Content source"
        value={source.kind}
        items={[
          {
            value: 'static' as SourceKind,
            title: 'Use a fixed image',
            description: 'Use the same image for every print record',
          },
          {
            value: 'field' as SourceKind,
            title: 'Use an input field',
            description: 'Choose a different image for each print record',
          },
        ]}
        onChange={onChangeKind}
      />
      {source.kind === 'static' ? (
        <View style={styles.imageView}>
          <ImageFileView path={source.asset?.path} onChange={onChangeImage} />
        </View>
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

const styles = StyleSheet.create({
  imageView: styleType<ViewStyle>({
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    minHeight: BASE64.PROFILE_ICON_SIZE,
  }),
})
