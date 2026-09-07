import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { InputDialog } from '@/components/Dialog'
import { Cell, Section } from '@/components/List'
import type { Layout, LayoutField } from '@/print'
import {
  createLayoutField,
  isFieldReferenced,
  removeField,
  upsertField,
} from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { fieldValueTypeItems } from '../ElementEditor/options'
import { PickerCell, TextValueCell } from '../ElementEditor/rows'

type ParamsProps = RouteProp<MainParams, 'LayoutFields'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  isDialogVisible: boolean
  onChangeField: (field: LayoutField) => void
  onDeleteField: (field: LayoutField) => void
  onPressAdd: () => void
  onSubmitLabel: (label: string) => void
  onCancelDialog: () => void
}

const Component: React.FC<ComponentProps> = ({
  layout,
  isDialogVisible,
  onChangeField,
  onDeleteField,
  onPressAdd,
  onSubmitLabel,
  onCancelDialog,
}) => {
  const styles = useStyles()

  if (!layout) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>レイアウトが見つかりません</Text>
      </View>
    )
  }

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          差し込み口は、印刷データごとに内容を変えたい箇所です。要素の「内容の決め方」で
          「印刷データから差し込む」を選ぶと、ここで作った差し込み口を指定できます。
        </Text>
        {layout.fields.length === 0 ? (
          <Section title="差し込み口">
            <Cell
              title="差し込み口がありません"
              description="下の「差し込み口を追加する」から作成してください"
              inactive={true}
            />
          </Section>
        ) : (
          layout.fields.map((field) => (
            <Section key={field.id} title={field.label || field.key}>
              <TextValueCell
                title="表示名"
                value={field.label}
                onChange={(label) => onChangeField({ ...field, label })}
              />
              <TextValueCell
                title="キー"
                value={field.key}
                dialogDescription="印刷データと結びつける識別子です"
                onChange={(key) => onChangeField({ ...field, key })}
              />
              <PickerCell
                title="入力の種類"
                value={field.valueType}
                items={fieldValueTypeItems}
                onChange={(valueType) => onChangeField({ ...field, valueType })}
              />
              <Cell
                title="この差し込み口を削除する"
                onPress={() => onDeleteField(field)}
              />
            </Section>
          ))
        )}
        <Section title="操作">
          <Cell title="差し込み口を追加する" onPress={onPressAdd} />
        </Section>
      </ScrollView>
      <InputDialog
        isVisible={isDialogVisible}
        title="差し込み口の追加"
        description="表示名を入力してください"
        onPress={onSubmitLabel}
        onCancel={onCancelDialog}
      />
    </>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    params: { layoutId },
  } = useRoute<ParamsProps>()

  const selector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const layout = useSelector(selector)

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: '差し込み口' })
  }, [navigation])

  const onChangeField = useCallback(
    (field: LayoutField) => {
      if (!layout) {
        return
      }
      dispatch(saveLayout(upsertField(layout, field)))
    },
    [dispatch, layout],
  )

  const onDeleteField = useCallback(
    async (field: LayoutField) => {
      if (!layout) {
        return
      }
      try {
        const referenced = isFieldReferenced(layout, field.id)
        const confirmed = await AlertAsync(
          '確認',
          referenced
            ? `「${field.label || field.key}」を削除しますか？\nこの差し込み口を使っている要素は、内容が空の固定値に戻ります。`
            : `「${field.label || field.key}」を削除しますか？`,
          [
            { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
            { text: MESSAGE.YES, onPress: () => true },
          ],
        )
        if (confirmed) {
          dispatch(saveLayout(removeField(layout, field.id)))
        }
      } catch (e: any) {
        console.warn('onDeleteField', e)
      }
    },
    [dispatch, layout],
  )

  const onPressAdd = useCallback(() => setIsDialogVisible(true), [])
  const onCancelDialog = useCallback(() => setIsDialogVisible(false), [])

  const onSubmitLabel = useCallback(
    (label: string) => {
      setIsDialogVisible(false)
      if (!layout) {
        return
      }
      const trimmed = label.trim()
      dispatch(
        saveLayout(
          upsertField(
            layout,
            createLayoutField({
              label: trimmed || '差し込み口',
              key: trimmed || `field${layout.fields.length + 1}`,
            }),
          ),
        ),
      )
    },
    [dispatch, layout],
  )

  return (
    <Component
      {...props}
      {...{
        layout,
        isDialogVisible,
        onChangeField,
        onDeleteField,
        onPressAdd,
        onSubmitLabel,
        onCancelDialog,
      }}
    />
  )
}

export { Container as LayoutFields }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    description: styleType<TextStyle>({
      padding: 16,
      fontSize: 12,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    empty: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }),
    emptyText: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
  })
  return styles
})
