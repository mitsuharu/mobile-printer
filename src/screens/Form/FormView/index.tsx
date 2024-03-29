import React, { useCallback, createRef, useState } from 'react'
import {
  Keyboard,
  View,
  ViewStyle,
  TextInput,
  StyleProp,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native'
import { useForm, ErrorOption } from 'react-hook-form'
import { ImageSource, Submission } from '@/redux/modules/printer/utils'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { TextInputController } from './TextInputController'
import { Spacer, SpacerLine } from '@/components/Spacer'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { SubmitView } from './SubmitView'
import { Base64ImageView } from '@/components/Base64ImageView'
import { BASE64 } from '@/CONSTANTS'
import { PrintImageTypeSegmentedControl } from './ImageTypeSegmentedControl'
import { PrintImageType } from '@mitsuharu/react-native-sunmi-printer-library'

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
    setValue,
    formState: { errors },
  } = useForm<Submission>({
    reValidateMode: 'onSubmit',
    defaultValues,
  })

  /**
   * PrintImageType を切り替えるセグメントコントロールの初期値
   * 画像の BASE64 の有無で判断する
   */
  const [enableSegmentedControl, setEnableSegmentedControl] = useState<boolean>(
    !!getValues('profile.icon.base64'),
  )

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

  /**
   * フォームで表示する Base64 を成形する
   */
  const makeShrunkenText = useCallback((text: string | undefined) => {
    if (text) {
      if (text.length > 35) {
        return '(' + text.slice(0, 10) + '...' + text.slice(-25) + ')'
      }
      return '(' + text + ')'
    }
    return ''
  }, [])

  /**
   * フォームで表示する Base64 のテキスト
   *
   * @note
   * Base64 の表示に TextInputController を利用するとレンダリングが遅くなる。
   * そのため、単純な Text + State で表示する
   */
  const [base64Text, setBase64Text] = useState(
    makeShrunkenText(getValues('profile.icon.base64')),
  )

  /**
   * 画像が選択されたときのイベント
   */
  const onChangeBase64 = useCallback(
    (base64: string) => {
      const imageSource: ImageSource | undefined = getValues('profile.icon')
      setValue('profile.icon', {
        base64: base64,
        width: imageSource?.width ?? BASE64.PROFILE_ICON_SIZE,
        type: imageSource?.type ?? 'binary',
      })
      setEnableSegmentedControl(true)
      setBase64Text(makeShrunkenText(base64))
    },
    [getValues, setValue, setBase64Text, makeShrunkenText],
  )

  /**
   * セグメントコントロールで選択されたときのイベント
   */
  const onChangePrintImageType = useCallback(
    (printImageTyp: PrintImageType) => {
      const imageSource: ImageSource | undefined = getValues('profile.icon')
      if (imageSource) {
        setValue('profile.icon', {
          ...imageSource,
          type: printImageTyp,
        })
      }
    },
    [getValues, setValue],
  )

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
      icon: createRef<TextInput>(),
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
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
          nextTextInputRef={inputRefs.profile.sns.facebook}
          returnKeyType={'next'}
        />
        <Spacer height={8} />

        <Text>Base64 でエンコードしたアイコン画像</Text>
        <Text>{base64Text}</Text>
        <Base64ImageView
          style={styles.base64ImageView}
          base64={getValues('profile.icon.base64')}
          onChange={onChangeBase64}
        />
        <PrintImageTypeSegmentedControl
          initialPrintImageType={getValues('profile.icon.type')}
          onChange={onChangePrintImageType}
          enabled={enableSegmentedControl}
        />
        <Spacer height={8} />

        <TextInputController
          formTitle={'X(Twitter)のアカウント'}
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
          formTitle={'GitHubのアカウント'}
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
      <SubmitView onSubmit={onPress} onDelete={onDelete} />
    </View>
  )
}

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    contentContainer: styleType<ViewStyle>({
      padding: 16,
    }),
    base64ImageView: styleType<ViewStyle>({
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 8,
    }),
  })
  return styles
})
