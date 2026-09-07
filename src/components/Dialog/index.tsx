import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  type KeyboardTypeOptions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { Button } from '@/components/Button'
import { styleType } from '@/utils/styles'

type Props = {
  title?: string
  description?: string
  isVisible: boolean

  /**
   * 入力欄の初期値
   */
  defaultValue?: string

  keyboardType?: KeyboardTypeOptions

  onCancel?: () => void
  onPress?: (text: string) => void
}
type ComponentProps = Props & {
  keyboardHeight: number
  defaultValue?: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  onCancel?: () => void
}

const Component: React.FC<ComponentProps> = ({
  isVisible,
  title,
  description,
  defaultValue,
  keyboardType,
  keyboardHeight,
  onChangeText,
  onSubmit,
  onCancel,
}) => {
  const styles = useStyles()

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      {/*
        Android の Modal は別ウィンドウのため adjustResize が効かず、
        キーボードがダイアログを覆ってしまう。キーボードの高さのぶん
        表示領域を詰めて、残った範囲の中央に置く。
      */}
      <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
        <View style={styles.dialog}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!description && (
            <Text style={styles.description}>{description}</Text>
          )}
          <TextInput
            style={styles.input}
            defaultValue={defaultValue}
            onChangeText={onChangeText}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize="none"
            autoFocus={true}
            underlineColorAndroid="transparent"
          />
          <View style={styles.footer}>
            <Button
              onPress={onCancel}
              text={MESSAGE.NO}
              style={styles.button}
              textStyle={styles.buttonText}
            />
            <Button
              onPress={onSubmit}
              text={MESSAGE.YES}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const Container: React.FC<Props> = (props) => {
  const { isVisible, defaultValue, onPress } = props

  const textRef = useRef(defaultValue ?? '')
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0)

  // 開くたびに初期値へ戻す
  useEffect(() => {
    if (isVisible) {
      textRef.current = defaultValue ?? ''
    }
  }, [isVisible, defaultValue])

  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })
    const onHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })
    return () => {
      onShow.remove()
      onHide.remove()
    }
  }, [])

  const onChangeText = useCallback((text: string) => {
    textRef.current = text
  }, [])

  const onSubmit = useCallback(() => {
    onPress?.(textRef.current)
  }, [onPress])

  return (
    <Component
      {...props}
      // 初期値が変わったら入力欄を作り直す
      key={`${isVisible}-${defaultValue}`}
      {...{ keyboardHeight, onChangeText, onSubmit }}
    />
  )
}

export { Container as InputDialog }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    }),
    dialog: styleType<ViewStyle>({
      width: '85%',
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    }),
    title: styleType<TextStyle>({
      fontSize: 18,
      fontWeight: 'bold',
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    description: styleType<TextStyle>({
      marginTop: 8,
      fontSize: 14,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    input: styleType<TextStyle>({
      marginTop: 16,
      paddingVertical: 8,
      paddingHorizontal: 0,
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    footer: styleType<ViewStyle>({
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
    }),
    button: styleType<ViewStyle>({
      paddingHorizontal: 16,
      paddingVertical: 12,
    }),
    buttonText: styleType<TextStyle>({
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
  })
  return styles
})
