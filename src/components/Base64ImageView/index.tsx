import { styleType } from '@/utils/styles'
import React, { useCallback } from 'react'
import {
  ViewStyle,
  StyleSheet,
  StyleProp,
  Image,
  ImageSourcePropType,
  ImageStyle,
  Pressable,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker'
import { useDispatch } from 'react-redux'

const IMAGE_SIZE = 100

type Props = {
  base64?: string
  onPress?: () => void
  onChange?: (base64: string) => void
  style?: StyleProp<ViewStyle>
}
type ComponentProps = Props & {
  source?: ImageSourcePropType
}

const Component: React.FC<ComponentProps> = ({ style, source, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        style,
        !!onPress && pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {source ? (
        <Image source={source} resizeMode={'contain'} style={styles.image} />
      ) : (
        <Icon name={'image-off-outline'} size={IMAGE_SIZE} />
      )}
    </Pressable>
  )
}

const Container: React.FC<Props> = (props) => {
  const { base64, onChange } = props

  const source: ImageSourcePropType | undefined = base64
    ? { uri: `data:image/png;base64,${base64}` }
    : undefined

  const onPress = useCallback(async () => {
    try {
      const { assets }: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 100,
        maxHeight: 100,
        quality: 0.8,
      })
      if (assets && assets.length > 0) {
        const [first] = assets
        if (first.base64) {
          onChange?.(first.base64)
        }
      }
    } catch (e: any) {
      console.warn(e)
    }
  }, [onChange])

  return <Component {...props} {...{ source, onPress }} />
}

export { Container as Base64ImageView }

const styles = StyleSheet.create({
  container: styleType<ViewStyle>({
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    opacity: 1.0,
  }),
  image: styleType<ImageStyle>({
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  }),
  pressed: styleType<ViewStyle>({
    opacity: 0.7,
  }),
})
