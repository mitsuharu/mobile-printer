import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { type KeyboardTypeOptions, View } from 'react-native'
import RnDialog from 'react-native-dialog'
import { MESSAGE } from '@/CONSTANTS'

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
type ComponentProps = Props & {}

const Component: React.FC<ComponentProps> = ({
  isVisible,
  title,
  description,
  defaultValue,
  keyboardType,
  onCancel,
  onPress,
}) => {
  const textRef = useRef(defaultValue ?? '')
  const onChangeText = useCallback(
    (text: string) => (textRef.current = text),
    [],
  )

  // 開くたびに初期値へ戻す
  useEffect(() => {
    if (isVisible) {
      textRef.current = defaultValue ?? ''
    }
  }, [isVisible, defaultValue])

  return (
    <View>
      <RnDialog.Container visible={isVisible}>
        <RnDialog.Title>{title}</RnDialog.Title>
        <RnDialog.Description>{description}</RnDialog.Description>
        <RnDialog.Input
          key={`${isVisible}-${defaultValue}`}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? 'url'}
          autoCapitalize={'none'}
        />
        <RnDialog.Button label={MESSAGE.NO} onPress={() => onCancel?.()} />
        <RnDialog.Button
          label={MESSAGE.YES}
          onPress={() => onPress?.(textRef.current)}
        />
      </RnDialog.Container>
    </View>
  )
}

const Container: React.FC<Props> = (props) => {
  return <Component {...props} {...{}} />
}

export { Container as InputDialog }
