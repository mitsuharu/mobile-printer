import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  type KeyboardTypeOptions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { Button } from '@/components/Button'
import { styleType } from '@/utils/styles'

/**
 * Modal が表示され切ってからキーボードを出すまでの待ち時間
 *
 * @note
 * 表示の途中で要求してもキーボードは出ない。
 */
const KEYBOARD_DELAY = 100

type Props = {
  title?: string
  description?: string
  isVisible: boolean

  /**
   * 入力欄の初期値
   */
  defaultValue?: string

  keyboardType?: KeyboardTypeOptions

  /**
   * 改行を入れられるようにするか
   */
  multiline?: boolean

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
  multiline,
  keyboardHeight,
  onChangeText,
  onSubmit,
  onCancel,
}) => {
  const styles = useStyles()

  const inputRef = useRef<TextInputInstance>(null)
  const keyboardTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  /**
   * 入力欄へフォーカスを当て直してキーボードを出す
   *
   * @note
   * Android の Modal は別ウィンドウのため、開いた時点で OS が入力欄へ
   * フォーカスを当てる。React Native は、すでにフォーカスを持っている
   * 入力欄への focus() を JS 側で捨てるため（TextInputState.focusTextInput）、
   * ネイティブへ命令が届かず、キーボードを出す要求も送られない。
   * 一度 blur() で手放してから当て直すと、命令が届いてキーボードが出る。
   */
  const showKeyboard = useCallback(() => {
    const input = inputRef.current
    if (!input) {
      return
    }
    if (!input.isFocused()) {
      input.focus()
      return
    }
    input.blur()
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  /**
   * ダイアログが表示され切ってからキーボードを出す
   */
  const onShow = useCallback(() => {
    keyboardTimer.current = setTimeout(showKeyboard, KEYBOARD_DELAY)
  }, [showKeyboard])

  useEffect(
    () => () => {
      if (keyboardTimer.current) {
        clearTimeout(keyboardTimer.current)
      }
    },
    [],
  )

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
      onShow={onShow}
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
          {/* キーボードを閉じたあとでも、タップすれば出し直せるようにする */}
          <TextInput
            ref={inputRef}
            onPressIn={showKeyboard}
            style={[styles.input, multiline && styles.multilineInput]}
            defaultValue={defaultValue}
            onChangeText={onChangeText}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
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

  // 閉じたあとに余白が残らないようにする
  useEffect(() => {
    if (!isVisible) {
      setKeyboardHeight(0)
    }
  }, [isVisible])

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
    // 入力する場所だと分かるように、線で囲って余白を広めに取る
    input: styleType<TextStyle>({
      marginTop: 16,
      minHeight: 48,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
      backgroundColor: COLOR(colorScheme).BACKGROUND.SECONDARY,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: COLOR(colorScheme).TEXT.SECONDARY,
      borderRadius: 4,
    }),
    multilineInput: styleType<TextStyle>({
      minHeight: 96,
      maxHeight: 160,
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
