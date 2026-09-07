import type React from 'react'
import {
  type Control,
  Controller,
  type FieldError,
  type FieldPath,
  type UseFormGetValues,
} from 'react-hook-form'
import {
  type ReturnKeyTypeOptions,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR } from '@/CONSTANTS'
import type { Submission } from '@/redux/modules/printer/utils'
import { styleType } from '@/utils/styles'
import { MyTextInput, type TextInputInstance } from './TextInput'
import { getValidationMessage, isValidIfEmpty } from './validation'

type Props = {
  style?: StyleProp<ViewStyle>

  formTitle: string

  control: Control<Submission, any>
  getValues: UseFormGetValues<Submission>

  error: FieldError | undefined

  fieldPath: FieldPath<Submission>

  returnKeyType?: ReturnKeyTypeOptions

  textInputRef: React.RefObject<TextInputInstance | null>
  nextTextInputRef?: React.RefObject<TextInputInstance | null>

  required?: boolean

  editable?: boolean
}

export const TextInputController: React.FC<Props> = ({
  formTitle,

  style,
  getValues,
  error,

  fieldPath,
  returnKeyType,

  control,
  textInputRef,
  nextTextInputRef,

  required,
  editable,
}) => {
  const styles = useStyles()

  return (
    <View style={style}>
      <Text style={styles.formTitle}>{formTitle}</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <MyTextInput
            ref={textInputRef}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value as string}
            placeholder={formTitle}
            style={styles.inputView}
            textContentType="name"
            keyboardType="default"
            returnKeyType={returnKeyType}
            blurOnSubmit={false}
            nextRef={nextTextInputRef}
            editable={editable !== undefined ? editable : true}
          />
        )}
        name={fieldPath}
        rules={{
          required: required ?? false,
          validate: required
            ? {
                empty: (arg: string) => isValidIfEmpty(arg),
              }
            : undefined,
        }}
        defaultValue={getValues(fieldPath)}
      />
      {error && (
        <View style={styles.errorView}>
          <Text style={styles.errorMessage}>{getValidationMessage(error)}</Text>
        </View>
      )}
    </View>
  )
}

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    formTitle: styleType<TextStyle>({
      lineHeight: 19,
      fontSize: 13,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    inputView: styleType<ViewStyle>({
      width: '100%',
      height: 40,
    }),
    errorView: styleType<ViewStyle>({
      backgroundColor: 'transparent',
      height: 36,
    }),
    errorMessage: styleType<TextStyle>({
      fontSize: 10,
      lineHeight: 15,
      color: 'red',
    }),
  })
  return styles
})
