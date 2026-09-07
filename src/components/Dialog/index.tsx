import type React from 'react'
import { useCallback, useRef } from 'react'
import { View } from 'react-native'
import RnDialog from 'react-native-dialog'
import { MESSAGE } from '@/CONSTANTS'

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
    [],
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
