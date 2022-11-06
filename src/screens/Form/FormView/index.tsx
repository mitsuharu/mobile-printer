import React, { useCallback, useMemo, createRef } from 'react'
import {
  Keyboard,
  View,
  ViewStyle,
  TextStyle,
  TextInput,
  StyleProp,
  useColorScheme,
  ScrollView,
} from 'react-native'
import { useForm, ErrorOption } from 'react-hook-form'
import { Submission } from '@/redux/modules/printer/utils'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { TextInputController } from './TextInputController'
import { Button } from '@/components/Button'
import { Spacer, SpacerLine } from '@/components/Spacer'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'

export type OnSubmit = (
  props: Submission,
  setError: (name: string, error: ErrorOption) => void,
) => void

type Props = {
  defaultValues?: Partial<Submission>
  style?: StyleProp<ViewStyle>
  onSubmit: OnSubmit
  onDelete: () => void
}

export const FormView: React.FC<Props> = ({
  defaultValues,
  style,
  onSubmit,
  onDelete,
}) => {
  const styles = useStyles()
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<Submission>({
    reValidateMode: 'onSubmit',
    defaultValues,
  })

  /**
   * handleSubmitに渡すonSubmit（validationが成功した場合に呼ばれる）
   */
  const innerOnSubmit = useCallback(
    (props: Submission) => {
      Keyboard.dismiss()
      onSubmit(props, setError)
    },
    [onSubmit, setError],
  )

  /**
   * handleSubmitに渡すonError（validationが失敗した場合に呼ばれる）
   */
  const innerOnError = useCallback(() => {
    Keyboard.dismiss()
    dispatch(enqueueSnackbar({ message: '入力に誤りがあります' }))
  }, [dispatch])

  const onPress = useCallback(() => {
    try {
      const execute = handleSubmit(innerOnSubmit, innerOnError)
      execute()
    } catch (e: any) {
      console.warn(e)
    }
  }, [handleSubmit, innerOnError, innerOnSubmit])

  // 次の入力フォームにfocusさせるため
  const inputRefs = {
    title: createRef<TextInput>(),
    profile: {
      name: createRef<TextInput>(),
      alias: createRef<TextInput>(),
      title: {
        position: createRef<TextInput>(),
        company: createRef<TextInput>(),
        address: createRef<TextInput>(),
      },
      description: createRef<TextInput>(),
      iconBase64: createRef<TextInput>(),
      sns: {
        twitter: createRef<TextInput>(),
        facebook: createRef<TextInput>(),
        github: createRef<TextInput>(),
        website: createRef<TextInput>(),
      },
      qr: {
        url: createRef<TextInput>(),
        description: createRef<TextInput>(),
      },
    },
  }

  return (
    <View style={style}>
      <ScrollView contentContainerStyle={styles.padding}>
        <TextInputController
          formTitle={'ファイル名'}
          control={control}
          getValues={getValues}
          error={errors.title}
          fieldPath={'title'}
          textInputRef={inputRefs.title}
          nextTextInputRef={inputRefs.profile.name}
          returnKeyType={'next'}
          required={true}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'名前'}
          control={control}
          getValues={getValues}
          error={errors.profile?.name}
          fieldPath={'profile.name'}
          textInputRef={inputRefs.profile.name}
          nextTextInputRef={inputRefs.profile.alias}
          returnKeyType={'next'}
          required={true}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'別名、読み仮名など'}
          control={control}
          getValues={getValues}
          error={errors.profile?.alias}
          fieldPath={'profile.alias'}
          textInputRef={inputRefs.profile.alias}
          nextTextInputRef={inputRefs.profile.title.company}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'会社名'}
          control={control}
          getValues={getValues}
          error={errors.profile?.title?.company}
          fieldPath={'profile.title.company'}
          textInputRef={inputRefs.profile.title.company}
          nextTextInputRef={inputRefs.profile.title.position}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'職種など'}
          control={control}
          getValues={getValues}
          error={errors.profile?.title?.position}
          fieldPath={'profile.title.position'}
          textInputRef={inputRefs.profile.title.position}
          nextTextInputRef={inputRefs.profile.title.address}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'アドレス（メールアドレス含む）など'}
          control={control}
          getValues={getValues}
          error={errors.profile?.title?.address}
          fieldPath={'profile.title.address'}
          textInputRef={inputRefs.profile.title.address}
          nextTextInputRef={inputRefs.profile.description}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'フリーテキストなど'}
          control={control}
          getValues={getValues}
          error={errors.profile?.description}
          fieldPath={'profile.description'}
          textInputRef={inputRefs.profile.description}
          nextTextInputRef={inputRefs.profile.iconBase64}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'Base 64 でエンコードしたアイコン画像'}
          control={control}
          getValues={getValues}
          error={errors.profile?.iconBase64}
          fieldPath={'profile.iconBase64'}
          textInputRef={inputRefs.profile.iconBase64}
          nextTextInputRef={inputRefs.profile.sns.twitter}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'Twitterのアカウント'}
          control={control}
          getValues={getValues}
          error={errors.profile?.sns?.twitter}
          fieldPath={'profile.sns.twitter'}
          textInputRef={inputRefs.profile.sns.twitter}
          nextTextInputRef={inputRefs.profile.sns.facebook}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'Facebookのアカウント'}
          control={control}
          getValues={getValues}
          error={errors.profile?.sns?.facebook}
          fieldPath={'profile.sns.facebook'}
          textInputRef={inputRefs.profile.sns.facebook}
          nextTextInputRef={inputRefs.profile.sns.github}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'Githubのアカウント'}
          control={control}
          getValues={getValues}
          error={errors.profile?.sns?.github}
          fieldPath={'profile.sns.github'}
          textInputRef={inputRefs.profile.sns.github}
          nextTextInputRef={inputRefs.profile.sns.website}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'Website'}
          control={control}
          getValues={getValues}
          error={errors.profile?.sns?.website}
          fieldPath={'profile.sns.website'}
          textInputRef={inputRefs.profile.sns.website}
          nextTextInputRef={inputRefs.profile.qr.url}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'QR URL'}
          control={control}
          getValues={getValues}
          error={errors.profile?.qr?.url}
          fieldPath={'profile.qr.url'}
          textInputRef={inputRefs.profile.qr.url}
          nextTextInputRef={inputRefs.profile.qr.description}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'QR 説明'}
          control={control}
          getValues={getValues}
          error={errors.profile?.qr?.description}
          fieldPath={'profile.qr.description'}
          textInputRef={inputRefs.profile.qr.description}
          nextTextInputRef={undefined}
          returnKeyType={'done'}
        />
        <Spacer height={8} />
      </ScrollView>

      <SpacerLine height={1} />
      <View style={styles.padding}>
        <Spacer height={8} />
        <Button
          text={'保存する'}
          onPress={onPress}
          style={styles.button}
          textStyle={[styles.buttonText, styles.saveButtonText]}
          // inactive={!isEnableSubmitButton}
        />
        <Spacer height={16} />
        <Button
          text={'削除する'}
          onPress={onDelete}
          style={[styles.button, styles.deleteButton]}
          textStyle={[styles.buttonText, styles.deleteButtonText]}
          // inactive={!isEnableSubmitButton}
        />
        <Spacer height={8} />
      </View>
    </View>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles(useColorScheme, (_colorScheme) => ({
  scrollView: styleType<ViewStyle>({
    flex: 1,
  }),
  padding: styleType<ViewStyle>({
    padding: 16,
  }),
  button: styleType<ViewStyle>({
    width: '100%',
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
}))
