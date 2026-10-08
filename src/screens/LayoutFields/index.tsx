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
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
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
        <Text style={styles.emptyText}>{'Layout not found'}</Text>
      </View>
    )
  }

  return (
    <>
      <SafeScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          {
            "Input fields contain values that can vary between print records. Select Use an input field under an element's Content source to use a field created here."
          }
        </Text>
        <Section>
          <Cell
            title="Add an input field"
            description="You can change the display name, key and input type after adding a field"
            onPress={onPressAdd}
          />
        </Section>
        {layout.fields.length === 0 ? (
          <Section title="Input fields">
            <Cell
              title="No input fields"
              description="Tap Add an input field above to create one"
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
                  : `${field.label || field.key} (unused)`
              }
            >
              {/*
                どの要素からも指定されていない項目は、印刷データへ入力しても
                読まれない。作った直後に気づけるよう、ここで理由を出す。
              */}
              {!isFieldReferenced(layout, field.id) && (
                <Cell
                  title="No element references this field"
                  description="Select Use an input field under an element's Content source and choose this field to include its value in the printout"
                  inactive={true}
                />
              )}
              <TextValueCell
                title="Display name"
                value={field.label}
                onChange={(label) => onChangeField({ ...field, label })}
              />
              <TextValueCell
                title="Key"
                value={field.key}
                dialogDescription="The identifier that links this field to print data"
                onChange={(key) => onChangeField({ ...field, key })}
              />
              <PickerCell
                title="Input type"
                value={field.valueType}
                items={fieldValueTypeItems}
                onChange={(valueType) => onChangeField({ ...field, valueType })}
              />
              <Cell
                title="Delete this input field"
                onPress={() => onDeleteField(field)}
              />
            </Section>
          ))
        )}
      </SafeScrollView>
      <InputDialog
        isVisible={isDialogVisible}
        title="Add input field"
        description="Enter a display name"
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
    navigation.setOptions({ title: 'Input fields' })
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
          'Confirm',
          referenced
            ? `Delete ${field.label || field.key}?\nElements that use this field will switch to empty fixed content.`
            : `Delete ${field.label || field.key}?`,
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
        dispatch(
          enqueueSnackbar({ message: 'Could not delete the input field' }),
        )
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
              label: trimmed || 'Input fields',
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
