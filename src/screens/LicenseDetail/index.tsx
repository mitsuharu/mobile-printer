import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import type React from 'react'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { useDispatch } from 'react-redux'
import { COLOR } from '@/CONSTANTS'
import { Cell, Section } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { findOssLicense, type OssLicense } from '@/licenses'
import { openWeb } from '@/redux/modules/inAppWebBrowser/slice'
import type { MainParams } from '@/routes/main.params'
import { styleType } from '@/utils/styles'

type Props = {}
type ComponentProps = Props & {
  license: OssLicense | undefined
  onPressHomepage: (url: string) => void
}

const Component: React.FC<ComponentProps> = ({ license, onPressHomepage }) => {
  const styles = useStyles()

  if (!license) {
    return (
      <SafeScrollView style={styles.scrollView}>
        <Section title="ライセンス">
          <Cell
            title="ライセンス情報が見つかりません"
            description="`yarn licenses:generate` で一覧を作り直してください"
          />
        </Section>
      </SafeScrollView>
    )
  }

  const { author, homepage, licenseText } = license

  return (
    <SafeScrollView style={styles.scrollView}>
      <Section title="パッケージ">
        <Cell title="バージョン" description={license.version} />
        <Cell title="ライセンス" description={license.license} />
        {!!author && <Cell title="作者" description={author} />}
        {!!homepage && (
          <Cell
            title="ホームページ"
            description={homepage}
            accessory="link"
            onPress={() => onPressHomepage(homepage)}
          />
        )}
      </Section>
      <Section title="ライセンス本文">
        <View style={styles.textContainer}>
          <Text style={styles.text} selectable={true}>
            {licenseText ??
              'このパッケージはライセンス本文を同梱していません。ホームページを参照してください。'}
          </Text>
        </View>
      </Section>
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { params } = useRoute<RouteProp<MainParams, 'LicenseDetail'>>()

  const license = useMemo(
    () => findOssLicense(params.licenseId),
    [params.licenseId],
  )

  useLayoutEffect(() => {
    navigation.setOptions({ title: license?.name ?? 'ライセンス' })
  }, [navigation, license])

  const onPressHomepage = useCallback(
    (url: string) => {
      dispatch(openWeb(url))
    },
    [dispatch],
  )

  return <Component {...props} {...{ license, onPressHomepage }} />
}

export { Container as LicenseDetail }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    textContainer: styleType<ViewStyle>({
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
      paddingVertical: 12,
      paddingHorizontal: 16,
    }),
    text: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.PRIMARY,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: Platform.select({ android: 'monospace', default: 'Courier' }),
    }),
  })
  return styles
})
