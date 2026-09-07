import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { BASE64, COLOR } from '@/CONSTANTS'
import { Base64ImageView } from '@/components/Base64ImageView'
import { Cell, Section } from '@/components/List'
import type { Layout, LayoutField, PrintData, PrintDataValue } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { selectPrintDataById } from '@/redux/modules/printData/selectors'
import { printLayout, savePrintData } from '@/redux/modules/printData/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { createUUID } from '@/utils/uuid'
import { TextValueCell } from '../ElementEditor/rows'

type ParamsProps = RouteProp<MainParams, 'PrintDataForm'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  printData: PrintData | undefined
  onChangeTitle: (title: string) => void
  onChangeValue: (field: LayoutField, value: PrintDataValue) => void
  onPressPreview: () => void
  onPressPrint: () => void
}

const textValueOf = (value: PrintDataValue | undefined) =>
  value?.kind === 'text' ? value.value : ''

const Component: React.FC<ComponentProps> = ({
  layout,
  printData,
  onChangeTitle,
  onChangeValue,
  onPressPreview,
  onPressPrint,
}) => {
  const styles = useStyles()

  if (!layout || !printData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>印刷データが見つかりません</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.scrollView}>
      <Section title="印刷データ">
        <TextValueCell
          title="名前"
          value={printData.title}
          dialogDescription="一覧に表示する名前です"
          onChange={onChangeTitle}
        />
      </Section>

      {layout.fields.length === 0 ? (
        <Section title="入力">
          <Cell
            title="入力する項目がありません"
            description="レイアウトの「差し込み口」を追加すると、ここに入力欄が現れます"
            inactive={true}
          />
        </Section>
      ) : (
        <Section title="入力">
          {layout.fields.map((field) =>
            field.valueType === 'image' ? (
              <View key={field.id} style={styles.imageRow}>
                <Text style={styles.imageLabel}>
                  {field.label || field.key}
                </Text>
                <Base64ImageView
                  base64={
                    printData.values[field.id]?.kind === 'image'
                      ? // biome-ignore lint/style/noNonNullAssertion: 直前の判定で画像であることを確かめている
                        (
                          printData.values[field.id] as {
                            asset: { base64: string }
                          }
                        ).asset.base64
                      : undefined
                  }
                  onChange={(base64) =>
                    onChangeValue(field, {
                      kind: 'image',
                      asset: {
                        id: createUUID(),
                        base64,
                        width: BASE64.PROFILE_ICON_SIZE,
                        imageType: 'binary',
                      },
                    })
                  }
                />
              </View>
            ) : (
              <TextValueCell
                key={field.id}
                title={field.label || field.key}
                value={textValueOf(printData.values[field.id])}
                keyboardType={field.valueType === 'url' ? 'url' : 'default'}
                onChange={(value) =>
                  onChangeValue(field, { kind: 'text', value })
                }
              />
            ),
          )}
        </Section>
      )}

      <Section title="操作">
        <Cell title="この内容で印刷する" onPress={onPressPrint} />
        <Cell
          title="印刷イメージを見る"
          onPress={onPressPreview}
          accessory="disclosure"
        />
      </Section>
    </ScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    params: { layoutId, printDataId },
  } = useRoute<ParamsProps>()

  const layoutSelector = useMemo(() => selectLayoutById(layoutId), [layoutId])
  const printDataSelector = useMemo(
    () => selectPrintDataById(printDataId),
    [printDataId],
  )
  const layout = useSelector(layoutSelector)
  const printData = useSelector(printDataSelector)

  useLayoutEffect(() => {
    navigation.setOptions({ title: printData?.title ?? '印刷データ' })
  }, [navigation, printData?.title])

  const onChangeTitle = useCallback(
    (title: string) => {
      if (!printData) {
        return
      }
      dispatch(savePrintData({ ...printData, title }))
    },
    [dispatch, printData],
  )

  const onChangeValue = useCallback(
    (field: LayoutField, value: PrintDataValue) => {
      if (!printData) {
        return
      }
      dispatch(
        savePrintData({
          ...printData,
          values: { ...printData.values, [field.id]: value },
        }),
      )
    },
    [dispatch, printData],
  )

  const onPressPreview = useCallback(() => {
    navigation.navigate('LayoutPreview', { layoutId, printDataId })
  }, [layoutId, navigation, printDataId])

  const onPressPrint = useCallback(() => {
    dispatch(printLayout({ layoutId, printDataId }))
  }, [dispatch, layoutId, printDataId])

  return (
    <Component
      {...props}
      {...{
        layout,
        printData,
        onChangeTitle,
        onChangeValue,
        onPressPreview,
        onPressPrint,
      }}
    />
  )
}

export { Container as PrintDataForm }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    imageRow: styleType<ViewStyle>({
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    }),
    imageLabel: styleType<TextStyle>({
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingBottom: 8,
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
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
