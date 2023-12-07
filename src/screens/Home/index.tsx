import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ViewStyle, ScrollView, StyleSheet, Linking } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  printProfile,
  printProfileRandomly,
  printText,
} from '@/redux/modules/printer/slice'
import { Cell, Section } from '@/components/List'
import { useNavigation } from '@react-navigation/native'
import { EditToggleButton } from '@/components/Button/EditToggleButton'
import { sampleProfile } from '@/redux/modules/printer/utils/sample'
import { selectPrinterSubmissions } from '@/redux/modules/printer/selectors'
import { createSubmission, Submission } from '@/redux/modules/printer/utils'
import { InputDialogCell } from './InputDialogCell'
import NfcManager, {
  NfcTech,
  Ndef,
  NfcEvents,
  TagEvent,
} from 'react-native-nfc-manager'

type Props = {}
type ComponentProps = Props & {
  isEditable: boolean
  submissions: Submission[]
  onPressSample: () => void
  onPressText: (text: string) => void
  onPressSubmission: (obj: Submission) => void
  onPressPrintProfileRandomly: () => void
  onPressNewSubmission: () => void
  onNavigateToPrinter: () => void
}

const Component: React.FC<ComponentProps> = ({
  isEditable,
  submissions,
  onPressSample,
  onPressText,
  onPressSubmission,
  onPressPrintProfileRandomly,
  onPressNewSubmission,
  onNavigateToPrinter,
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
          inactive={isEditable}
        />
        <Cell
          title="その他"
          onPress={onNavigateToPrinter}
          inactive={isEditable}
          accessory="disclosure"
        />
      </Section>
      <Section title="プロフィール印刷">
        {submissions.map((submission) => (
          <Cell
            title={submission.title}
            onPress={() => onPressSubmission(submission)}
            accessory={isEditable ? 'disclosure' : undefined}
            key={submission.uuid}
          />
        ))}
      </Section>
      <Section title="プロフィール印刷のオプション">
        <Cell
          title="サンプルのプロフィールを印刷する"
          onPress={onPressSample}
          inactive={isEditable}
        />
        <Cell
          title="プロフィールをランダム印刷する"
          onPress={onPressPrintProfileRandomly}
          inactive={isEditable}
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
      title: 'モバイル印刷 for SUNMI',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <EditToggleButton isEditable={isEditable} toggle={toggle} />
      ),
    })
  }, [navigation, isEditable, toggle])

  const onPressSample = useCallback(() => {
    nfcSample()
    //     dispatch(printProfile(sampleProfile))
  }, [nfcSample, dispatch])

  const onPressText = useCallback(
    (text: string) => {
      dispatch(printText({ text: text, size: 'default' }))
    },
    [dispatch],
  )

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

  const onPressPrintProfileRandomly = useCallback(() => {
    dispatch(printProfileRandomly())
  }, [dispatch])

  const onPressNewSubmission = useCallback(() => {
    navigation.navigate('Form', { submission: createSubmission() })
  }, [navigation])

  const onNavigateToPrinter = useCallback(() => {
    navigation.navigate('Printer')
  }, [navigation])

  const nfcSample = useCallback(async () => {
    try {
      const isSupported = await NfcManager.isSupported()
      console.log(`isSupported: ${isSupported}`)

      const isEnabled = await NfcManager.isEnabled()
      console.log(`isEnabled: ${isEnabled}`)

      if (!isEnabled) {
        // 無効なので設定から有効にしてもらう
        Linking.sendIntent(`android.settings.NFC_SETTINGS`)
        return
      }

      // requestTechnology か registerTagEvent() のどちらか

      console.log(`requestTechnology`)
      await NfcManager.requestTechnology(NfcTech.Ndef)
      console.log(`getTag`)
      const tag = await NfcManager.getTag()
      console.log('Tag found', tag)
      if (tag) {
        const [{ payload }] = tag.ndefMessage
        console.log(`payload: ${payload}`)
        const data: Uint8Array = payload as unknown as Uint8Array
        const result = await Ndef.uri.decodePayload(data)
        console.log(`result: ${result}`)
      }
    } catch (error: any) {
      console.warn(error)
    } finally {
      console.log(`finally`)
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest()
    }
  }, [])

  // useEffect(() => {
  //   NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
  //     const tagFound = tag
  //     console.log(tagFound)
  //     // NfcManager.unregisterTagEvent();
  //   })
  //   NfcManager.registerTagEvent()
  // }, [])

  return (
    <Component
      {...props}
      {...{
        isEditable,
        submissions,
        onPressSample,
        onPressText,
        onPressSubmission,
        onPressPrintProfileRandomly,
        onPressNewSubmission,
        onNavigateToPrinter,
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
