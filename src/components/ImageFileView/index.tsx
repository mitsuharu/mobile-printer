import type React from 'react'
import { useCallback, useState } from 'react'
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { BASE64 } from '@/CONSTANTS'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { fetchResizedImagePath } from '@/utils/ImagePicker'
import { styleType } from '@/utils/styles'

type Props = {
  /**
   * 表示する画像ファイルのパス
   */
  path?: string

  onPress?: () => void

  /**
   * 選び直した画像ファイルのパスを返す
   */
  onChange?: (path: string) => void

  style?: StyleProp<ViewStyle>
}
type ComponentProps = Props & {
  source?: ImageSourcePropType
}

const makeImageSource = (
  path: string | undefined,
): ImageSourcePropType | undefined =>
  path ? { uri: `file://${path}` } : undefined

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
  const { path, onChange } = props
  const dispatch = useDispatch()

  const [source, setSource] = useState<ImageSourcePropType | undefined>(
    makeImageSource(path),
  )

  const onPress = useCallback(async () => {
    try {
      const nextPath = await fetchResizedImagePath(BASE64.PROFILE_ICON_SIZE)
      if (nextPath) {
        onChange?.(nextPath)
        setSource(makeImageSource(nextPath))
      }
    } catch (e: any) {
      console.warn('ImageFileView', e)
      dispatch(enqueueSnackbar({ message: `画像を選べませんでした` }))
    }
  }, [dispatch, onChange])

  return <Component {...props} {...{ source, onPress }} />
}

export { Container as ImageFileView }

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
