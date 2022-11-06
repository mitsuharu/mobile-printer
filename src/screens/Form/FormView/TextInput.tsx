import React, { useCallback, forwardRef } from 'react'
import {
  View,
  ViewStyle,
  TextStyle,
  TextInput,
  useColorScheme,
} from 'react-native'
import { COLOR } from '@/CONSTANTS/COLOR'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'

// reactjs - Typescript React: Access component property types - Stack Overflow
// https://stackoverflow.com/questions/43230765/typescript-react-access-component-property-types
type Props = React.ComponentProps<typeof TextInput> & {
  /** このTextInputのref */
  ref?: React.Ref<TextInput | null>
  /** 次のTextInputのref */
  nextRef?: React.Ref<TextInput | null>
}

type ComponentProps = Omit<Props, 'ref'> & {
  forwardedRef?: React.ForwardedRef<TextInput>
}

type TextInputRefObject = React.RefObject<TextInput>

const isTextInputRefObject = (arg: any): arg is TextInputRefObject => {
  return (
    typeof arg === 'object' &&
    Object.prototype.hasOwnProperty.call(arg, 'current')
  )
}

const Component: React.FC<ComponentProps> = (props) => {
  const { style, forwardedRef, nextRef, editable } = props
  const styles = useStyles()

  const focusNext = useCallback(() => {
    if (isTextInputRefObject(nextRef)) {
      nextRef.current?.focus()
    }
  }, [nextRef])

  return (
    <View
      style={[style, styles.container, editable === false && styles.disable]}
    >
      <TextInput
        {...props}
        style={[styles.textInput, editable === false && styles.disable]}
        clearButtonMode="while-editing"
        secureTextEntry={false}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={styles.textPlaceholder.color}
        selectionColor={styles.textSelection.color}
        ref={forwardedRef}
        onSubmitEditing={focusNext}
      />
    </View>
  )
}

export const MyTextInput = forwardRef<TextInput, Props>((props, ref) => (
  <Component {...props} forwardedRef={ref} />
))

const useStyles = makeStyles(useColorScheme, (colorScheme) => ({
  container: styleType<ViewStyle>({
    flexDirection: 'row',
    borderColor: COLOR(colorScheme).CLEAR,
    borderBottomWidth: 1,
    opacity: 1.0,
  }),
  textInput: styleType<TextStyle>({
    flex: 1,
    color: COLOR(colorScheme).TEXT.PRIMARY,
    backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    fontSize: 13,
    lineHeight: 19,
    height: 40,
    justifyContent: 'center',
    borderColor: COLOR(colorScheme).TEXT.SECONDARY,
    borderWidth: 1,
    borderRadius: 8,
  }),
  textSelection: styleType<TextStyle>({
    color: COLOR(colorScheme).TEXT.PRIMARY,
  }),
  textPlaceholder: styleType<TextStyle>({
    color: COLOR(colorScheme).TEXT.SECONDARY,
  }),
  disable: styleType<ViewStyle>({
    opacity: 0.7,
  }),
}))
