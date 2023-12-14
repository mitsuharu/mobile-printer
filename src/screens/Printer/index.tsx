import React, { useCallback, useLayoutEffect, useState } from 'react'
import { ViewStyle, ScrollView, StyleSheet } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  duplicateQRCode,
  printImageFromImagePicker,
  printQRCode,
  printText,
} from '@/redux/modules/printer/slice'
import { Cell, Section } from '@/components/List'
import { useNavigation } from '@react-navigation/native'
import { InputDialogCell } from './InputDialogCell'
import { selectNfcIsSupported } from '@/redux/modules/nfc/selectors'
import { startReadingNfc } from '@/redux/modules/nfc/slice'

type Props = {}
type ComponentProps = Props & {
  onPressText: (text: string) => void
  onPressImageBinary: () => void
  onPressImageGrayscale: () => void
  onPressQRCode: (text: string) => void
  onPressDuplicateQRCode: () => void
  isNfcSupported: boolean
  onPressNfc: () => void
}

const Component: React.FC<ComponentProps> = ({
  onPressText,
  onPressImageBinary,
  onPressImageGrayscale,
  onPressQRCode,
  onPressDuplicateQRCode,
  isNfcSupported,
  onPressNfc,
}) => {
  const styles = useStyles()

  return (
    <ScrollView style={styles.scrollView}>
      <Section title="テキスト">
        <InputDialogCell
          title="テキストを印刷する"
          dialogTitle="テキスト印刷"
          dialogDescription="印刷するテキストを入力してください"
          onSelectText={onPressText}
        />
      </Section>
      <Section title="画像">
        <Cell title="画像を白黒で印刷する" onPress={onPressImageBinary} />
        <Cell
          title="画像をグレースケールで印刷する"
          onPress={onPressImageGrayscale}
        />
      </Section>
      <Section title="QRコード">
        <InputDialogCell
          title="QRコードを印刷する"
          dialogTitle="QRコード印刷"
          dialogDescription="印刷するQRコードに変換するテキストを入力してください"
          onSelectText={onPressQRCode}
        />
        <Cell title="QRコードを複製する" onPress={onPressDuplicateQRCode} />
      </Section>
      {isNfcSupported && (
        <Section title="NFCタグ">
          <Cell title="NFCタグの内容を複製する" onPress={onPressNfc} />
        </Section>
      )}
    </ScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const [isEditable, setIsEditable] = useState<boolean>(false)
  const isNfcSupported = useSelector(selectNfcIsSupported)

  const toggle = useCallback(() => {
    setIsEditable(!isEditable)
  }, [isEditable, setIsEditable])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '汎用印刷',
    })
  }, [navigation, isEditable, toggle])

  const onPressText = useCallback(
    (text: string) => {
      dispatch(printText({ text: text, size: 'default' }))
    },
    [dispatch],
  )

  const onPressImageBinary = useCallback(() => {
    dispatch(printImageFromImagePicker('binary'))
  }, [dispatch])

  const onPressImageGrayscale = useCallback(() => {
    dispatch(printImageFromImagePicker('grayscale'))
  }, [dispatch])

  const onPressQRCode = useCallback(
    (text: string) => {
      dispatch(printQRCode({ text }))
    },
    [dispatch],
  )

  const onPressDuplicateQRCode = useCallback(() => {
    dispatch(duplicateQRCode())
  }, [dispatch])

  const onPressNfc = useCallback(() => {
    dispatch(startReadingNfc())
  }, [dispatch])

  return (
    <Component
      {...props}
      {...{
        onPressText,
        onPressImageBinary,
        onPressImageGrayscale,
        onPressQRCode,
        onPressDuplicateQRCode,
        isNfcSupported,
        onPressNfc,
      }}
    />
  )
}

export { Container as Printer }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
