import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import {
  getApplicationName,
  getBuildNumber,
  getVersion,
} from 'react-native-device-info'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch } from 'react-redux'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { ossLicenses } from '@/licenses'
import { openWeb } from '@/redux/modules/inAppWebBrowser/slice'
import { styleType } from '@/utils/styles'

const REPOSITORY_URL = 'https://github.com/mitsuharu/mobile-printer'
const ISSUES_URL = `${REPOSITORY_URL}/issues`

type Props = {}
type ComponentProps = Props & {
  appName: string
  version: string
  licenseCount: number
  onPressGuide: () => void
  onPressLicenses: () => void
  onPressRepository: () => void
  onPressIssues: () => void
}

const Component: React.FC<ComponentProps> = ({
  appName,
  version,
  licenseCount,
  onPressGuide,
  onPressLicenses,
  onPressRepository,
  onPressIssues,
}) => {
  const styles = useStyles()

  return (
    <SafeScrollView style={styles.scrollView}>
      <Section title="User guide">
        <Cell
          title="How to use this app"
          description="Quick printing, layout printing and creating layouts"
          accessory="disclosure"
          onPress={onPressGuide}
        />
      </Section>
      <Section title="App">
        <Cell title="Name" description={appName} />
        <Cell title="Version" description={version} />
      </Section>
      <Section title="Open-source licenses">
        <Cell
          title="Software used by this app"
          description={`${licenseCount} packages`}
          accessory="disclosure"
          onPress={onPressLicenses}
        />
      </Section>
      <Section title="Links">
        <Cell
          title="Source code"
          description="mitsuharu/mobile-printer"
          accessory="link"
          onPress={onPressRepository}
        />
        <Cell
          title="Report an issue"
          description="Report errors or unexpected behavior through GitHub Issues"
          accessory="link"
          onPress={onPressIssues}
        />
      </Section>
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const appName = useMemo(() => getApplicationName(), [])
  const version = useMemo(() => `${getVersion()} (${getBuildNumber()})`, [])
  const licenseCount = useMemo(() => ossLicenses.length, [])

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'About this app' })
  }, [navigation])

  const onPressGuide = useCallback(() => {
    navigation.navigate('Guide')
  }, [navigation])

  const onPressLicenses = useCallback(() => {
    navigation.navigate('Licenses')
  }, [navigation])

  const onPressRepository = useCallback(() => {
    dispatch(openWeb(REPOSITORY_URL))
  }, [dispatch])

  const onPressIssues = useCallback(() => {
    dispatch(openWeb(ISSUES_URL))
  }, [dispatch])

  return (
    <Component
      {...props}
      {...{
        appName,
        version,
        licenseCount,
        onPressGuide,
        onPressLicenses,
        onPressRepository,
        onPressIssues,
      }}
    />
  )
}

export { Container as AppInfo }

const useStyles = makeStyles(() => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
  })
  return styles
})
