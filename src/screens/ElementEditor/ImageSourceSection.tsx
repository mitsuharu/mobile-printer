import type React from 'react'
import { useCallback } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { BASE64 } from '@/CONSTANTS'
import { ImageFileView } from '@/components/ImageFileView'
import { Cell, Section } from '@/components/List'
import type { ImageSource, Layout } from '@/print'
import { copyImageFile } from '@/utils/imageStore'
import { styleType } from '@/utils/styles'
import { createUUID } from '@/utils/uuid'
import { PickerCell } from './rows'

type Props = {
  layout: Layout
  source: ImageSource
  width: number
  onChange: (source: ImageSource) => void
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

const styles = StyleSheet.create({
  imageView: styleType<ViewStyle>({
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    minHeight: BASE64.PROFILE_ICON_SIZE,
  }),
})
