import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import AlertAsync from 'react-native-alert-async'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch } from 'react-redux'
import { MESSAGE } from '@/CONSTANTS'
import { deleteSubmission, saveSubmission } from '@/redux/modules/printer/slice'
import type { Submission } from '@/redux/modules/printer/utils'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'
import { FormView, type OnSubmit } from './FormView'

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
