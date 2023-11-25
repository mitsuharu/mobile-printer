import React, { useCallback, useLayoutEffect, useState } from 'react'
import { ViewStyle, ScrollView, StyleSheet } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  printImageFromImagePicker,
  printProfile,
} from '@/redux/modules/printer/slice'
import { Cell, Section } from '@/components/List'
import { useNavigation } from '@react-navigation/native'
import { EditToggleButton } from '@/components/Button/EditToggleButton'
import { sampleProfile } from '@/redux/modules/printer/utils/sample'
import { selectPrinterSubmissions } from '@/redux/modules/printer/selectors'
import { createSubmission, Submission } from '@/redux/modules/printer/utils'

type Props = {}
type ComponentProps = Props & {
  isEditable: boolean
  submissions: Submission[]
  onPressSample: () => void
  onPressImageFromImagePicker: () => void
  onPressSubmission: (obj: Submission) => void
  onPressNewSubmission: () => void
}

const Component: React.FC<ComponentProps> = ({
  isEditable,
  submissions,
  onPressSample,
  onPressImageFromImagePicker,
  onPressSubmission,
  onPressNewSubmission,
}) => {
  const styles = useStyles()

  return (
    <ScrollView style={styles.scrollView}>
      <Section title="汎用印刷">
        <Cell title="画像を印刷する" onPress={onPressImageFromImagePicker} />
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
        <Cell title="サンプルプロフィールを印刷する" onPress={onPressSample} />
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
      title: 'モバイル名刺印刷',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <EditToggleButton isEditable={isEditable} toggle={toggle} />
      ),
    })
  }, [navigation, isEditable, toggle])

  const onPressSample = useCallback(() => {
    dispatch(printProfile(sampleProfile))
  }, [dispatch])

  const onPressImageFromImagePicker = useCallback(() => {
    dispatch(printImageFromImagePicker())
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
        onPressImageFromImagePicker,
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
