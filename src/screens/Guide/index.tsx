import { useNavigation } from '@react-navigation/native'
import type React from 'react'
import { useLayoutEffect } from 'react'
import {
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR } from '@/CONSTANTS'
import { SectionHeader } from '@/components/List'
import { SafeScrollView } from '@/components/SafeScrollView'
import { styleType } from '@/utils/styles'
import { type GuideSection, guideSections } from './sections'

type Props = {}
type ComponentProps = Props & {
  sections: GuideSection[]
}

const Component: React.FC<ComponentProps> = ({ sections }) => {
  const styles = useStyles()

  return (
    <SafeScrollView style={styles.scrollView}>
      {sections.map(({ title, body }) => (
        <View key={title}>
          <SectionHeader title={title} />
          <View style={styles.bodyContainer}>
            <Text style={styles.body}>{body}</Text>
          </View>
        </View>
      ))}
    </SafeScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ title: '使い方' })
  }, [navigation])

  return <Component {...props} {...{ sections: guideSections }} />
}

export { Container as Guide }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    scrollView: styleType<ViewStyle>({
      flex: 1,
    }),
    bodyContainer: styleType<ViewStyle>({
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
      paddingVertical: 12,
      paddingHorizontal: 16,
    }),
    body: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.PRIMARY,
      fontSize: 15,
      lineHeight: 23,
    }),
  })
  return styles
})
