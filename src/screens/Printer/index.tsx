import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect } from 'react'
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch, useSelector } from 'react-redux'
import { Cell, Section } from '@/components/List'
import { selectNfcIsSupported } from '@/redux/modules/nfc/selectors'
import { startReadingNfc } from '@/redux/modules/nfc/slice'
import {
  duplicateQRCode,
  printImageFromImagePicker,
  printQRCode,
  printText,
} from '@/redux/modules/printer/slice'
import { styleType } from '@/utils/styles'
import { InputDialogCell } from './InputDialogCell'

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
      <Section title="Text">
        <InputDialogCell
          title="Print text"
          dialogTitle="Text printing"
          dialogDescription="Enter the text to print"
          onSelectText={onPressText}
        />
      </Section>
      <Section title="Image">
        <Cell
          title="Print image in black and white"
          onPress={onPressImageBinary}
        />
        <Cell
          title="Print image in grayscale"
          onPress={onPressImageGrayscale}
        />
      </Section>
      <Section title="QR code">
        <InputDialogCell
          title="Print QR code"
          dialogTitle="QR code printing"
          dialogDescription="Enter the text to encode as a QR code"
          onSelectText={onPressQRCode}
        />
        <Cell title="Copy a QR code" onPress={onPressDuplicateQRCode} />
      </Section>
      {isNfcSupported && (
        <Section title="NFC tags">
          <Cell title="Copy NFC tag content" onPress={onPressNfc} />
        </Section>
      )}
    </ScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isNfcSupported = useSelector(selectNfcIsSupported)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Quick print',
    })
  }, [navigation])

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
