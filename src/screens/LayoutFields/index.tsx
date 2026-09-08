import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
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
import { SafeScrollView } from '@/components/SafeScrollView'
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
      <SafeScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          入力項目は、印刷データごとに内容を変えたい箇所です。要素の「内容の決め方」で
          「印刷データごとに入力する」を選ぶと、ここで作った入力項目を指定できます。
        </Text>
        <Section>
          <Cell
            title="入力項目を追加する"
            description="表示名・キー・入力の種類は、追加したあとに変更できます"
            onPress={onPressAdd}
          />
        </Section>
        {layout.fields.length === 0 ? (
          <Section title="入力項目">
            <Cell
              title="入力項目がありません"
              description="上の「入力項目を追加する」から作成してください"
              inactive={true}
            />
          </Section>
        ) : (
          layout.fields.map((field) => (
            <Section
              key={field.id}
              title={
                isFieldReferenced(layout, field.id)
                  ? field.label || field.key
                  : `${field.label || field.key}（未使用）`
              }
            >
              {/*
                どの要素からも指定されていない項目は、印刷データへ入力しても
                読まれない。作った直後に気づけるよう、ここで理由を出す。
              */}
              {!isFieldReferenced(layout, field.id) && (
                <Cell
                  title="どの要素からも指定されていません"
                  description="要素の「内容の決め方」で「印刷データごとに入力する」を選び、この項目を指定すると印刷に反映されます"
                  inactive={true}
                />
              )}
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
                title="この入力項目を削除する"
                onPress={() => onDeleteField(field)}
              />
            </Section>
          ))
        )}
      </SafeScrollView>
      <InputDialog
        isVisible={isDialogVisible}
        title="入力項目の追加"
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
    navigation.setOptions({ title: '入力項目' })
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
            ? `「${field.label || field.key}」を削除しますか？\nこの入力項目を使っている要素は、内容が空の固定値に戻ります。`
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
              label: trimmed || '入力項目',
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
