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
import { BASE64 } from '@/CONSTANTS'
import { fetchBase64Image } from '@/utils/ImagePicker'

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
  base64 ? { uri: `${BASE64.PREFIX}${base64}` } : undefined

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
        <Icon name={'image-off-outline'} size={BASE64.PROFILE_ICON_SIZE} />
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
      const base64Image = await fetchBase64Image(BASE64.PROFILE_ICON_SIZE)
      if (!!base64Image) {
        onChange?.(base64Image)
        setSource(makeBase64ImageSource(base64Image))
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
    width: BASE64.PROFILE_ICON_SIZE,
    height: BASE64.PROFILE_ICON_SIZE,
    opacity: 1.0,
  }),
  image: styleType<ImageStyle>({
    width: BASE64.PROFILE_ICON_SIZE,
    height: BASE64.PROFILE_ICON_SIZE,
  }),
  pressed: styleType<ViewStyle>({
    opacity: 0.7,
  }),
})
