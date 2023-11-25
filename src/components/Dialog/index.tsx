import { MESSAGE } from '@/CONSTANTS/MESSAGE'
import React, { useCallback, useRef } from 'react'
import { View } from 'react-native'
import RnDialog from 'react-native-dialog'

type Props = {
  title?: string
  description?: string
  isVisible: boolean
  onCancel?: () => void
  onPress?: (text: string) => void
}
type ComponentProps = Props & {}

const Component: React.FC<ComponentProps> = ({
  isVisible,
  title,
  description,
  onCancel,
  onPress,
}) => {
  const textRef = useRef('')
  const onChangeText = useCallback(
    (text: string) => (textRef.current = text),
    [textRef],
  )

  return (
    <View>
      <RnDialog.Container visible={isVisible}>
        <RnDialog.Title>{title}</RnDialog.Title>
        <RnDialog.Description>{description}</RnDialog.Description>
        <RnDialog.Input
          defaultValue={undefined}
          onChangeText={onChangeText}
          keyboardType={'url'}
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
