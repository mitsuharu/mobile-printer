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
import type { Layout, LayoutElement } from '@/print'
import { removeElement, replaceElement } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { saveLayout } from '@/redux/modules/layout/slice'
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
  onChange: (element: LayoutElement) => void
  onDelete: () => void
}

const hideWhenEmptyCell = (
  element: Extract<LayoutElement, { hideWhenEmpty: boolean }>,
  onChange: (element: LayoutElement) => void,
) => (
  <Cell
    title="内容が空なら印刷しない"
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
        <Text style={styles.emptyText}>要素が見つかりません</Text>
      </View>
    )
  }

  return (
    <SafeScrollView style={styles.scrollView}>
      {element.type === 'text' && (
        <>
          <TextSourceSection
            title="内容"
            layout={layout}
            source={element.source}
            onChange={(source) => onChange({ ...element, source })}
          />
          <Section title="体裁">
            <PickerCell
              title="文字の大きさ"
              value={element.fontSize}
              items={fontSizeItems}
              onChange={(fontSize) => onChange({ ...element, fontSize })}
            />
            <PickerCell
              title="寄せ"
              value={element.alignment}
              items={alignmentItems}
              onChange={(alignment) => onChange({ ...element, alignment })}
            />
            <Cell
              title="太字"
              accessory="switch"
              switchValue={element.bold}
              onSwitchValueChange={(bold) => onChange({ ...element, bold })}
            />
            <Cell
              title="下線"
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
            onChange={(source) => onChange({ ...element, source })}
          />
          <Section title="体裁">
            <NumberValueCell
              title="印刷する幅"
              value={element.width}
              unit="px"
              min={1}
              max={BASE64.MAX_SIZE}
              onChange={(width) => onChange({ ...element, width })}
            />
            <PickerCell
              title="変換方法"
              value={element.imageType}
              items={imageTypeItems}
              onChange={(imageType) => onChange({ ...element, imageType })}
            />
            <PickerCell
              title="寄せ"
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
            title="内容"
            layout={layout}
            source={element.source}
            onChange={(source) => onChange({ ...element, source })}
          />
          <Section title="体裁">
            <NumberValueCell
              title="大きさ"
              value={element.moduleSize}
              min={1}
              max={16}
              onChange={(moduleSize) => onChange({ ...element, moduleSize })}
            />
            <PickerCell
              title="誤り訂正レベル"
              value={element.errorLevel}
              items={errorLevelItems}
              onChange={(errorLevel) => onChange({ ...element, errorLevel })}
            />
            <PickerCell
              title="寄せ"
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
              title={`${index + 1}列目`}
              layout={layout}
              source={column.source}
              onChange={(source) =>
                onChange({
                  ...element,
                  columns: element.columns.map((value, i) =>
                    i === index ? { ...value, source } : value,
                  ),
                })
              }
            />
            <Section>
              <NumberValueCell
                title={`${index + 1}列目の幅`}
                value={column.width}
                unit="文字"
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
                title={`${index + 1}列目の寄せ`}
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
        <Section title="列">
          <Cell
            title="列を追加する"
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
              title="最後の列を削除する"
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
        <Section title="体裁">
          <PickerCell
            title="線の種類"
            value={element.barType}
            items={barTypeItems}
            onChange={(barType) => onChange({ ...element, barType })}
          />
        </Section>
      )}

      {element.type === 'spacer' && (
        <Section title="体裁">
          <NumberValueCell
            title="空ける行数"
            value={element.lines}
            unit="行"
            min={1}
            max={20}
            onChange={(lines) => onChange({ ...element, lines })}
          />
        </Section>
      )}

      {element.type === 'timestamp' && (
        <Section title="体裁">
          <PickerCell
            title="書式"
            value={element.format}
            items={timestampFormatItems}
            onChange={(format) => onChange({ ...element, format })}
          />
          <TextValueCell
            title="書式を直接指定する"
            value={element.format}
            dialogDescription="dayjs の書式で指定します"
            onChange={(format) => onChange({ ...element, format })}
          />
          <PickerCell
            title="寄せ"
            value={element.alignment}
            items={alignmentItems}
            onChange={(alignment) => onChange({ ...element, alignment })}
          />
        </Section>
      )}

      <Section title="操作">
        <Cell title="この要素を削除する" onPress={onDelete} />
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
      title: element ? describeElementType(element.type) : '要素',
    })
  }, [navigation, element])

  const onChange = useCallback(
    (next: LayoutElement) => {
      if (!layout) {
        return
      }
      dispatch(saveLayout(replaceElement(layout, next)))
    },
    [dispatch, layout],
  )

  const onDelete = useCallback(async () => {
    if (!layout || !element) {
      return
    }
    try {
      const confirmed = await AlertAsync(
        '確認',
        `${describeElementType(element.type)}の要素を削除しますか？`,
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
