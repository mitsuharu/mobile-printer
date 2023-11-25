import React, { useCallback, useLayoutEffect } from 'react'
import { ViewStyle, StyleSheet } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch } from 'react-redux'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { Submission } from '@/redux/modules/printer/utils'
import { MainParams } from '@/routes/main.params'
import { FormView, OnSubmit } from './FormView'
import { deleteSubmission, saveSubmission } from '@/redux/modules/printer/slice'
import { SafeAreaView } from 'react-native-safe-area-context'
import AlertAsync from 'react-native-alert-async'
import { MESSAGE } from '@/CONSTANTS/MESSAGE'

type ParamsProps = RouteProp<MainParams, 'Form'>

type Props = {}
type ComponentProps = Props & {
  submission: Submission
  onSubmit: OnSubmit
  onDelete: () => void
}

const Component: React.FC<ComponentProps> = ({
  submission,
  onSubmit,
  onDelete,
}) => {
  const styles = useStyles()

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FormView
        onSubmit={onSubmit}
        onDelete={onDelete}
        defaultValues={submission}
        style={styles.formView}
      />
    </SafeAreaView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()

  const {
    params: { submission },
  } = useRoute<ParamsProps>()

  const dispatch = useDispatch()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '入力フォーム',
    })
  }, [navigation])

  const onSubmit = useCallback<OnSubmit>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (payload, _setError) => {
      try {
        dispatch(saveSubmission(payload))
        navigation.goBack()
      } catch (e: any) {
        console.warn(e)
      }
    },
    [dispatch, navigation],
  )

  const onDelete = useCallback(async () => {
    try {
      const result = await AlertAsync('確認', '削除しますか？', [
        { text: MESSAGE.NO, onPress: () => false, style: 'cancel' },
        { text: MESSAGE.YES, onPress: () => true },
      ])
      if (result) {
        dispatch(deleteSubmission(submission))
        navigation.goBack()
      }
    } catch (e: any) {
      console.warn(e)
    }
  }, [dispatch, navigation, submission])

  return <Component {...props} {...{ submission, onSubmit, onDelete }} />
}

export { Container as Form }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    safeAreaView: styleType<ViewStyle>({
      flex: 1,
    }),
    formView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
