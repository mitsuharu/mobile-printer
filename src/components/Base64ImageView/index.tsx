import { styleType } from '@/utils/styles'
import React, { useCallback, useState } from 'react'
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

/**
 * 保存される画像の大きさ
 */
const SAVED_IMAGE_SIZE = 200

/**
 * 表示される画像の大きさ
 */
const STYLE_IMAGE_SIZE = 200

type Props = {
  base64?: string
  onPress?: () => void
  onChange?: (base64: string) => void
  style?: StyleProp<ViewStyle>
}
type ComponentProps = Props & {
  source?: ImageSourcePropType
}

const makeBase64ImageSource = (
  base64: string | undefined,
): ImageSourcePropType | undefined =>
  base64 ? { uri: `data:image/png;base64,${base64}` } : undefined

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
        <Icon name={'image-off-outline'} size={STYLE_IMAGE_SIZE} />
      )}
    </Pressable>
  )
}

const Container: React.FC<Props> = (props) => {
  const { base64, onChange } = props

  const [source, setSource] = useState<ImageSourcePropType | undefined>(
    makeBase64ImageSource(base64),
  )

  const onPress = useCallback(async () => {
    try {
      const { assets }: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: SAVED_IMAGE_SIZE,
        maxHeight: SAVED_IMAGE_SIZE,
        quality: 0.8,
      })
      if (assets && assets.length > 0) {
        const [first] = assets
        if (first.base64) {
          onChange?.(first.base64)
          setSource(makeBase64ImageSource(first.base64))
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
    width: STYLE_IMAGE_SIZE,
    height: STYLE_IMAGE_SIZE,
    opacity: 1.0,
  }),
  image: styleType<ImageStyle>({
    width: STYLE_IMAGE_SIZE,
    height: STYLE_IMAGE_SIZE,
  }),
  pressed: styleType<ViewStyle>({
    opacity: 0.7,
  }),
})
