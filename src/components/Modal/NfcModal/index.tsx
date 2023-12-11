import React, { useCallback } from 'react'
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native'
import { styleType } from '@/utils/styles'
import { makeStyles } from 'react-native-swag-styles'
import { Button } from '@/components/Button'
import { MESSAGE, COLOR } from '@/CONSTANTS'
import { useSelector, useDispatch } from 'react-redux'
import { selectNfcIsReading } from '@/redux/modules/nfc/selectors'
import { stopReadingNfc } from '@/redux/modules/nfc/slice'

type Props = {}
type ComponentProps = Props & {
  title: string
  description?: string
  visible: boolean
  onCancel: () => void
}

const Component: React.FC<ComponentProps> = ({
  title,
  description,
  visible,
  onCancel,
}) => {
  const styles = useStyles()
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
      onDismiss={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <ActivityIndicator
            animating={true}
            style={styles.activityIndicator}
            size="large"
          />
          <Button
            onPress={onCancel}
            text={MESSAGE.CANCEL}
            style={styles.buttonView}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </Modal>
  )
}

const Container: React.FC<Props> = (props) => {
  const dispatch = useDispatch()
  const isReading = useSelector(selectNfcIsReading)

  const onCancel = useCallback(() => {
    dispatch(stopReadingNfc())
  }, [dispatch])

  const title = 'NFCタグの読込み'

  const description = 'NFCタグを端末に近づけてください'

  return (
    <Component
      {...props}
      title={title}
      description={description}
      visible={isReading}
      onCancel={onCancel}
    />
  )
}

export { Container as NfcModel }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    }),
    modal: styleType<ViewStyle>({
      margin: 8,
      width: '80%',
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    }),
    activityIndicator: styleType<ViewStyle>({
      margin: 20,
    }),
    title: styleType<TextStyle>({
      fontSize: 28,
      fontWeight: 'bold',
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    description: styleType<TextStyle>({
      fontSize: 16,
      fontWeight: '400',
      color: COLOR(colorScheme).TEXT.SECONDARY,
      marginVertical: 8,
    }),
    buttonView: styleType<ViewStyle>({
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLOR(colorScheme).TEXT.PRIMARY,
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    }),
    buttonText: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
  })
  return styles
})
