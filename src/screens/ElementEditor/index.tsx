import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
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
import { BASE64, COLOR, MESSAGE } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import type { Layout, LayoutElement, LayoutField } from '@/print'
import { removeElement, replaceElement, upsertField } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { describeElementType } from '../LayoutEditor/describeElement'
import { ImageSourceSection } from './ImageSourceSection'
import {
  alignmentItems,
  barTypeItems,
  errorLevelItems,
  fontSizeItems,
  imageTypeItems,
  timestampFormatItems,
} from './options'
import { NumberValueCell, PickerCell, TextValueCell } from './rows'
import { TextSourceSection } from './TextSourceSection'

type ParamsProps = RouteProp<MainParams, 'ElementEditor'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  element: LayoutElement | undefined
  /**
   * 要素を差し替える
   *
   * 供給元の編集でその場で作った入力項目は `field` で受け取り、
   * 要素の変更と同じ保存へまとめる。別々に保存すると片方が失われる。
   */
  onChange: (element: LayoutElement, field?: LayoutField) => void
  onDelete: () => void
}

const hideWhenEmptyCell = (
  element: Extract<LayoutElement, { hideWhenEmpty: boolean }>,
  onChange: (element: LayoutElement) => void,
) => (
  <Cell
    title="Skip this element when empty"
    accessory="switch"
    switchValue={element.hideWhenEmpty}
    onSwitchValueChange={(hideWhenEmpty) =>
      onChange({ ...element, hideWhenEmpty })
    }
  />
)

const Component: React.FC<ComponentProps> = ({
  layout,
  element,
  onChange,
  onDelete,
}) => {
  const styles = useStyles()

  if (!layout || !element) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{'Element not found'}</Text>
      </View>
    )
  }

  return (
    <SafeScrollView style={styles.scrollView}>
      {element.type === 'text' && (
        <>
          <TextSourceSection
            title="Content"
            layout={layout}
            source={element.source}
            onChange={(source, field) =>
              onChange({ ...element, source }, field)
            }
          />
          <Section title="Appearance">
            <PickerCell
              title="Font size"
              value={element.fontSize}
              items={fontSizeItems}
              onChange={(fontSize) => onChange({ ...element, fontSize })}
            />
            <PickerCell
              title="Alignment"
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            <Cell
              title="Bold"
              accessory="switch"
              switchValue={element.bold}
              onSwitchValueChange={(bold) => onChange({ ...element, bold })}
            />
            <Cell
              title="Underline"
              accessory="switch"
              switchValue={element.underline}
              onSwitchValueChange={(underline) =>
                onChange({ ...element, underline })
              }
            />
            {hideWhenEmptyCell(element, onChange)}
          </Section>
        </>
      )}

      {element.type === 'image' && (
        <>
          <ImageSourceSection
            layout={layout}
            source={element.source}
            width={element.width}
            onChange={(source, field) =>
              onChange({ ...element, source }, field)
            }
          />
          <Section title="Appearance">
            <NumberValueCell
              title="Print width"
              value={element.width}
              unit="px"
              min={1}
              max={BASE64.MAX_SIZE}
              onChange={(width) => onChange({ ...element, width })}
            />
            <PickerCell
              title="Image conversion"
              value={element.imageType}
              items={imageTypeItems}
              onChange={(imageType) => onChange({ ...element, imageType })}
            />
            <PickerCell
              title="Alignment"
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            {hideWhenEmptyCell(element, onChange)}
          </Section>
        </>
      )}

      {element.type === 'qrcode' && (
        <>
          <TextSourceSection
            title="Content"
            layout={layout}
            source={element.source}
            onChange={(source, field) =>
              onChange({ ...element, source }, field)
            }
          />
          <Section title="Appearance">
            <NumberValueCell
              title="Size"
              value={element.moduleSize}
              min={1}
              max={16}
              onChange={(moduleSize) => onChange({ ...element, moduleSize })}
            />
            <PickerCell
              title="Error correction level"
              value={element.errorLevel}
              items={errorLevelItems}
              onChange={(errorLevel) => onChange({ ...element, errorLevel })}
            />
            <PickerCell
              title="Alignment"
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            {hideWhenEmptyCell(element, onChange)}
          </Section>
        </>
      )}

      {element.type === 'columns' &&
        element.columns.map((column, index) => (
          <View key={`column-${element.id}-${index}`}>
            <TextSourceSection
              title={`Column ${index + 1}`}
              layout={layout}
              source={column.source}
              onChange={(source, field) =>
                onChange(
                  {
                    ...element,
                    columns: element.columns.map((value, i) =>
                      i === index ? { ...value, source } : value,
                    ),
                  },
                  field,
                )
              }
            />
            <Section>
              <NumberValueCell
                title={`Column ${index + 1} width`}
                value={column.width}
                unit="Text"
                min={1}
                max={48}
                onChange={(width) =>
                  onChange({
                    ...element,
                    columns: element.columns.map((value, i) =>
                      i === index ? { ...value, width } : value,
                    ),
                  })
                }
              />
              <PickerCell
                title={`Column ${index + 1} alignment`}
                value={column.alignment}
                items={alignmentItems}
                onChange={(alignment) =>
                  onChange({
                    ...element,
                    columns: element.columns.map((value, i) =>
                      i === index ? { ...value, alignment } : value,
                    ),
                  })
                }
              />
            </Section>
          </View>
        ))}

      {element.type === 'columns' && (
        <Section title="Columns">
          <Cell
            title="Add a column"
            onPress={() =>
              onChange({
                ...element,
                columns: [
                  ...element.columns,
                  {
                    source: { kind: 'static', value: '' },
                    width: 10,
                    alignment: 'left',
                  },
                ],
              })
            }
          />
          {element.columns.length > 1 && (
            <Cell
              title="Remove the last column"
              onPress={() =>
                onChange({
                  ...element,
                  columns: element.columns.slice(0, -1),
                })
              }
            />
          )}
          {hideWhenEmptyCell(element, onChange)}
        </Section>
      )}

      {element.type === 'divider' && (
        <Section title="Appearance">
          <PickerCell
            title="Line style"
            value={element.barType}
            items={barTypeItems}
            onChange={(barType) => onChange({ ...element, barType })}
          />
        </Section>
      )}

      {element.type === 'spacer' && (
        <Section title="Appearance">
          <NumberValueCell
            title="Blank lines"
            value={element.lines}
            unit="lines"
            min={1}
            max={20}
            onChange={(lines) => onChange({ ...element, lines })}
          />
        </Section>
      )}

      {element.type === 'timestamp' && (
        <Section title="Appearance">
          <PickerCell
            title="Date format"
            value={element.format}
            items={timestampFormatItems}
            onChange={(format) => onChange({ ...element, format })}
          />
          <TextValueCell
            title="Enter a custom format"
            value={element.format}
            dialogDescription="Use dayjs date format tokens"
            onChange={(format) => onChange({ ...element, format })}
          />
          <PickerCell
            title="Alignment"
            value={element.alignment}
            items={alignmentItems}
            onChange={(alignment) => onChange({ ...element, alignment })}
          />
        </Section>
      )}

      <Section title="Actions">
        <Cell title="Delete this element" onPress={onDelete} />
      </Section>
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    params: { layoutId, elementId },
  } = useRoute<ParamsProps>()

  const selector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const layout = useSelector(selector)
  const element = layout?.elements.find(({ id }) => id === elementId)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: element ? describeElementType(element.type) : 'Element',
    })
  }, [navigation, element])

  const onChange = useCallback(
    (next: LayoutElement, field?: LayoutField) => {
      if (!layout) {
        return
      }
      const base = field ? upsertField(layout, field) : layout
      dispatch(saveLayout(replaceElement(base, next)))
    },
    [dispatch, layout],
  )

  const onDelete = useCallback(async () => {
    if (!layout || !element) {
      return
    }
    try {
      const confirmed = await AlertAsync(
        'Confirm',
        `Delete the ${describeElementType(element.type)} element?`,
        [
          { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
          { text: MESSAGE.YES, onPress: () => true },
        ],
      )
      if (confirmed) {
        dispatch(saveLayout(removeElement(layout, element.id)))
        navigation.goBack()
      }
    } catch (e: any) {
      console.warn('onDelete', e)
      dispatch(enqueueSnackbar({ message: 'Could not delete the element' }))
    }
  }, [dispatch, element, layout, navigation])

  return <Component {...props} {...{ layout, element, onChange, onDelete }} />
}

export { Container as ElementEditor }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
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
