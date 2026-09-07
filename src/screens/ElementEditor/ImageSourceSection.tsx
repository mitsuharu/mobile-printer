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
        label: trimmed || '入力項目',
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
    <Section title="内容">
      <PickerCell
        title="内容の決め方"
        value={source.kind}
        items={[
          {
            value: 'static' as SourceKind,
            title: 'レイアウトに直接置く',
            description: 'どの印刷データでも同じ画像になります',
          },
          {
            value: 'field' as SourceKind,
            title: '印刷データごとに入力する',
            description: '印刷データごとに画像を変えられます',
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

const styles = StyleSheet.create({
  imageView: styleType<ViewStyle>({
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    minHeight: BASE64.PROFILE_ICON_SIZE,
  }),
})
