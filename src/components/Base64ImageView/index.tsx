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
import MultipleImagePicker, {
  MediaType,
} from '@baronha/react-native-multiple-image-picker'
import ImageResizer from '@bam.tech/react-native-image-resizer'
import { readFile } from 'react-native-fs'

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
      const { path, width, height } = await MultipleImagePicker.openPicker({
        mediaType: 'image' as MediaType,
        usedCameraButton: false,
        isPreview: false,
        singleSelectedMode: true,
      })

      const { uri } = await ImageResizer.createResizedImage(
        path,
        BASE64.PROFILE_ICON_SIZE,
        (BASE64.PROFILE_ICON_SIZE * height) / width,
        'PNG',
        80,
        0,
      )

      const base64Data = await readFile(uri, { encoding: 'base64' })

      onChange?.(base64Data)
      setSource(makeBase64ImageSource(base64Data))
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
