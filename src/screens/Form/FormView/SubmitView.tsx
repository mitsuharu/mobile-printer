import React from 'react'
import { View, ViewStyle, TextStyle, StyleProp, StyleSheet } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { Button } from '@/components/Button'
import { Spacer } from '@/components/Spacer'

type Props = {
  style?: StyleProp<ViewStyle>
  onSubmit: () => void
  onDelete: () => void
  isEnableSubmitButton?: boolean
  isEnableDeleteButton?: boolean
}

type ComponentProps = Props & {
  inactiveSubmit: boolean
  inactiveDelete: boolean
}

const Component: React.FC<ComponentProps> = ({
  style,
  onSubmit,
  onDelete,
  inactiveSubmit,
  inactiveDelete,
}) => {
  const styles = useStyles()

  return (
    <View style={[styles.container, style]}>
      <Button
        text={'削除する'}
        onPress={onDelete}
        style={[styles.button, styles.deleteButton]}
        textStyle={[styles.buttonText, styles.deleteButtonText]}
        inactive={inactiveDelete}
      />
      <Spacer height={16} width={16} />
      <Button
        text={'保存する'}
        onPress={onSubmit}
        style={styles.button}
        textStyle={[styles.buttonText, styles.saveButtonText]}
        inactive={inactiveSubmit}
      />
    </View>
  )
}

const Container: React.FC<Props> = (props) => {
  const { isEnableSubmitButton, isEnableDeleteButton } = props

  const inactiveSubmit =
    isEnableSubmitButton !== undefined ? !isEnableSubmitButton : false

  const inactiveDelete =
    isEnableDeleteButton !== undefined ? !isEnableDeleteButton : false

  return <Component {...props} {...{ inactiveSubmit, inactiveDelete }} />
}

export { Container as SubmitView }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flexDirection: 'row',
      padding: 16,
    }),
    button: styleType<ViewStyle>({
      flex: 1,
      height: 40,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: 'gray',
      borderRadius: 8,
      borderWidth: 1,
    }),
    deleteButton: styleType<ViewStyle>({
      backgroundColor: 'red',
    }),
    buttonText: styleType<TextStyle>({
      fontSize: 20,
    }),
    saveButtonText: styleType<TextStyle>({
      color: 'black',
    }),
    deleteButtonText: styleType<TextStyle>({
      color: 'white',
    }),
  })
  return styles
})
