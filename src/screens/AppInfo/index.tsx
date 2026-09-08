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

type Props = {}
type ComponentProps = Props & {
  appName: string
  version: string
  licenseCount: number
  onPressGuide: () => void
  onPressLicenses: () => void
  onPressRepository: () => void
}

const Component: React.FC<ComponentProps> = ({
  appName,
  version,
  licenseCount,
  onPressGuide,
  onPressLicenses,
  onPressRepository,
}) => {
  const styles = useStyles()

  return (
    <SafeScrollView style={styles.scrollView}>
      <Section title="使い方">
        <Cell
          title="このアプリの使い方"
          description="汎用印刷とレイアウト印刷の違い、レイアウトの作り方"
          accessory="disclosure"
          onPress={onPressGuide}
        />
      </Section>
      <Section title="アプリ">
        <Cell title="名前" description={appName} />
        <Cell title="バージョン" description={version} />
      </Section>
      <Section title="オープンソースライセンス">
        <Cell
          title="使用しているソフトウェア"
          description={`${licenseCount}個のパッケージ`}
          accessory="disclosure"
          onPress={onPressLicenses}
        />
      </Section>
      <Section title="リンク">
        <Cell
          title="ソースコード"
          description="mitsuharu/mobile-printer"
          accessory="link"
          onPress={onPressRepository}
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
    navigation.setOptions({ title: 'このアプリについて' })
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
