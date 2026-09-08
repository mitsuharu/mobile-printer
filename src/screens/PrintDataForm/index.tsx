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
import { BASE64, COLOR, ICON, MESSAGE } from '@/CONSTANTS'
import { ImageFileView } from '@/components/ImageFileView'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import type { Layout, LayoutField, PrintData, PrintDataValue } from '@/print'
import { unusedFields as findUnusedFields } from '@/print'
import { selectLayoutById } from '@/redux/modules/layout/selectors'
import { selectPrintDataById } from '@/redux/modules/printData/selectors'
import {
  deletePrintData,
  printLayout,
  savePrintData,
} from '@/redux/modules/printData/slice'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import type { MainParams } from '@/routes/main.params'
import { copyImageFile } from '@/utils/imageStore'
import { styleType } from '@/utils/styles'
import { createUUID } from '@/utils/uuid'
import { TextValueCell } from '../ElementEditor/rows'

type ParamsProps = RouteProp<MainParams, 'PrintDataForm'>

type Props = {}
type ComponentProps = Props & {
  layout: Layout | undefined
  printData: PrintData | undefined

  /**
   * 要素から参照されている入力項目。ここへの入力だけが印刷に出る
   */
  usedFields: LayoutField[]

  /**
   * どの要素からも参照されていない入力項目
   */
  unusedFields: LayoutField[]
  onChangeTitle: (title: string) => void
  onChangeValue: (field: LayoutField, value: PrintDataValue) => void
  onChangeImage: (field: LayoutField, path: string) => Promise<void>
  onPressPreview: () => void
  onPressPrint: () => void
  onPressLayout: () => void
  onPressDelete: () => void
}

const textValueOf = (value: PrintDataValue | undefined) =>
  value?.kind === 'text' ? value.value : ''

const imagePathOf = (value: PrintDataValue | undefined) =>
  value?.kind === 'image' ? value.asset.path : undefined

/**
 * 未使用の項目に入っている値を、入力させずに見せる
 */
const describeValue = (value: PrintDataValue | undefined) => {
  if (value?.kind === 'image') {
    return '画像あり'
  }
  return value?.value || '未入力'
}

const Component: React.FC<ComponentProps> = ({
  layout,
  printData,
  usedFields,
  unusedFields,
  onChangeTitle,
  onChangeValue,
  onChangeImage,
  onPressPreview,
  onPressPrint,
  onPressLayout,
  onPressDelete,
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
    <SafeScrollView style={styles.scrollView}>
      <Section title="印刷データ">
        {/*
          入力項目にも「名前」が並ぶため、ここは「印刷データ名」と呼び分ける
        */}
        <TextValueCell
          title="印刷データ名"
          value={printData.title}
          dialogDescription="一覧に表示する名前です"
          onChange={onChangeTitle}
        />
      </Section>

      {usedFields.length === 0 ? (
        <Section title="入力">
          <Cell
            title="入力する項目がありません"
            description={
              layout.fields.length === 0
                ? 'レイアウトの「入力項目」を追加すると、ここに入力欄が現れます'
                : '入力項目はありますが、どの要素からも指定されていません'
            }
            inactive={true}
          />
        </Section>
      ) : (
        <Section title="入力">
          {usedFields.map((field) =>
            field.valueType === 'image' ? (
              <View key={field.id} style={styles.imageRow}>
                <Text style={styles.imageLabel}>
                  {field.label || field.key}
                </Text>
                <ImageFileView
                  path={imagePathOf(printData.values[field.id])}
                  onChange={(path) => onChangeImage(field, path)}
                />
              </View>
            ) : (
              <TextValueCell
                key={field.id}
                title={field.label || field.key}
                value={textValueOf(printData.values[field.id])}
                keyboardType={field.valueType === 'url' ? 'url' : 'default'}
                multiline={field.valueType === 'multilineText'}
                onChange={(value) =>
                  onChangeValue(field, { kind: 'text', value })
                }
              />
            ),
          )}
        </Section>
      )}

      {unusedFields.length > 0 && (
        <Section title="このレイアウトで使っていない項目">
          {/*
            要素の「内容の決め方」を「レイアウトに直接書く」へ変えても、入力項目は
            レイアウトに残る。そのまま入力欄として並べると、入力したのに印刷が
            変わらない。値は消さずに残したまま、入力させずに理由を添える。
          */}
          <Cell
            title="入力しても印刷には出ません"
            description="レイアウトの要素で「内容の決め方」を「印刷データごとに入力する」にして、この項目を指定すると反映されます"
            inactive={true}
          />
          {unusedFields.map((field) => (
            <Cell
              key={field.id}
              title={field.label || field.key}
              description={describeValue(printData.values[field.id])}
              inactive={true}
            />
          ))}
        </Section>
      )}

      <Section title="操作">
        <Cell title="この内容で印刷する" onPress={onPressPrint} />
        <Cell
          title="印刷イメージを見る"
          onPress={onPressPreview}
          accessory="disclosure"
        />
        <Cell
          title="レイアウトを編集する"
          description={layout.name}
          icon={ICON.LAYOUT}
          onPress={onPressLayout}
          accessory="disclosure"
        />
        <Cell title="この印刷データを削除する" onPress={onPressDelete} />
      </Section>
    </SafeScrollView>
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

  const unusedFields = useMemo(
    () => (layout ? findUnusedFields(layout) : []),
    [layout],
  )
  const usedFields = useMemo(
    () =>
      layout
        ? layout.fields.filter(
            (field) => !unusedFields.some(({ id }) => id === field.id),
          )
        : [],
    [layout, unusedFields],
  )

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

  const onChangeImage = useCallback(
    async (field: LayoutField, pickedPath: string) => {
      try {
        // 画像を選び直したら別のアセットとして保存する
        const id = createUUID()
        const path = await copyImageFile(id, pickedPath)
        onChangeValue(field, {
          kind: 'image',
          asset: {
            id,
            path,
            width: BASE64.PROFILE_ICON_SIZE,
            imageType: 'binary',
          },
        })
      } catch (e: any) {
        console.warn('onChangeImage', e)
        dispatch(enqueueSnackbar({ message: `画像を取り込めませんでした` }))
      }
    },
    [dispatch, onChangeValue],
  )

  const onPressPreview = useCallback(() => {
    navigation.navigate('LayoutPreview', { layoutId, printDataId })
  }, [layoutId, navigation, printDataId])

  const onPressPrint = useCallback(() => {
    dispatch(printLayout({ layoutId, printDataId }))
  }, [dispatch, layoutId, printDataId])

  const onPressLayout = useCallback(() => {
    navigation.navigate('LayoutEditor', { layoutId })
  }, [layoutId, navigation])

  const onPressDelete = useCallback(async () => {
    if (!printData) {
      return
    }
    try {
      const confirmed = await AlertAsync(
        '確認',
        `「${printData.title}」を削除しますか？`,
        [
          { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
          { text: MESSAGE.YES, onPress: () => true },
        ],
      )
      if (confirmed) {
        dispatch(deletePrintData(printData))
        navigation.goBack()
      }
    } catch (e: any) {
      console.warn('onPressDelete', e)
      dispatch(enqueueSnackbar({ message: `削除できませんでした` }))
    }
  }, [dispatch, navigation, printData])

  return (
    <Component
      {...props}
      {...{
        layout,
        printData,
        usedFields,
        unusedFields,
        onChangeTitle,
        onChangeValue,
        onChangeImage,
        onPressPreview,
        onPressPrint,
        onPressLayout,
        onPressDelete,
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
