import React, { useCallback, useLayoutEffect, useState } from 'react'
import { ViewStyle, ScrollView, StyleSheet } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  duplicateQRCode,
  printImageFromImagePicker,
  printProfile,
  printQRCode,
  printText,
} from '@/redux/modules/printer/slice'
import { Cell, Section } from '@/components/List'
import { useNavigation } from '@react-navigation/native'
import { EditToggleButton } from '@/components/Button/EditToggleButton'
import { sampleProfile } from '@/redux/modules/printer/utils/sample'
import { selectPrinterSubmissions } from '@/redux/modules/printer/selectors'
import { createSubmission, Submission } from '@/redux/modules/printer/utils'
import { InputDialogCell } from './InputDialogCell'

type Props = {}
type ComponentProps = Props & {
  isEditable: boolean
  submissions: Submission[]
  onPressSample: () => void
  onPressText: (text: string) => void
  onPressImage: () => void
  onPressQRCode: (text: string) => void
  onPressDuplicateQRCode: () => void
  onPressSubmission: (obj: Submission) => void
  onPressNewSubmission: () => void
}

const Component: React.FC<ComponentProps> = ({
  isEditable,
  submissions,
  onPressSample,
  onPressText,
  onPressImage,
  onPressQRCode,
  onPressDuplicateQRCode,
  onPressSubmission,
  onPressNewSubmission,
}) => {
  const styles = useStyles()

  return (
    <ScrollView style={styles.scrollView}>
      <Section title="汎用印刷">
        <InputDialogCell
          title="テキストを印刷する"
          dialogTitle="テキスト印刷"
          dialogDescription="印刷するテキストを入力してください"
          onSelectText={onPressText}
        />
        <Cell title="画像を印刷する" onPress={onPressImage} />
        <InputDialogCell
          title="QRコードを印刷する"
          dialogTitle="QRコード印刷"
          dialogDescription="印刷するQRコードに変換するテキストを入力してください"
          onSelectText={onPressQRCode}
        />
        <Cell title="QRコードを複製する" onPress={onPressDuplicateQRCode} />
      </Section>
      <Section title="プロフィールを印刷する">
        {submissions.map((submission) => (
          <Cell
            title={submission.title}
            onPress={() => onPressSubmission(submission)}
            accessory={isEditable ? 'disclosure' : undefined}
            key={submission.uuid}
          />
        ))}
      </Section>
      <Section>
        <Cell
          title="サンプルのプロフィールを印刷する"
          onPress={onPressSample}
        />
        {isEditable ? (
          <Cell
            title="プロフィールを追加する"
            onPress={onPressNewSubmission}
            accessory={'disclosure'}
          />
        ) : null}
      </Section>
    </ScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const submissions: Submission[] = useSelector(selectPrinterSubmissions)

  const [isEditable, setIsEditable] = useState<boolean>(false)

  const toggle = useCallback(() => {
    setIsEditable(!isEditable)
  }, [isEditable, setIsEditable])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'モバイル印刷',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <EditToggleButton isEditable={isEditable} toggle={toggle} />
      ),
    })
  }, [navigation, isEditable, toggle])

  const onPressSample = useCallback(() => {
    dispatch(printProfile(sampleProfile))
  }, [dispatch])

  const onPressText = useCallback(
    (text: string) => {
      dispatch(printText({ text: text, size: 'default' }))
    },
    [dispatch],
  )

  const onPressImage = useCallback(() => {
    dispatch(printImageFromImagePicker())
  }, [dispatch])

  const onPressQRCode = useCallback(
    (text: string) => {
      dispatch(printQRCode({ text }))
    },
    [dispatch],
  )

  const onPressDuplicateQRCode = useCallback(() => {
    dispatch(duplicateQRCode())
  }, [dispatch])

  const onPressSubmission = useCallback(
    (submission: Submission) => {
      if (isEditable) {
        navigation.navigate('Form', { submission: submission })
      } else {
        dispatch(printProfile(submission.profile))
      }
    },
    [dispatch, isEditable, navigation],
  )

  const onPressNewSubmission = useCallback(() => {
    navigation.navigate('Form', { submission: createSubmission() })
  }, [navigation])

  return (
    <Component
      {...props}
      {...{
        isEditable,
        submissions,
        onPressSample,
        onPressText,
        onPressImage,
        onPressQRCode,
        onPressDuplicateQRCode,
        onPressSubmission,
        onPressNewSubmission,
      }}
    />
  )
}

export { Container as Home }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
