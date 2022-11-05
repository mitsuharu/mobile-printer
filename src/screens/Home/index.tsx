import React, { useCallback, useLayoutEffect, useState } from 'react'
import { ViewStyle, ScrollView } from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch, useSelector } from 'react-redux'
import { print } from '@/redux/modules/printer/slice'
import { Cell, Section } from '@/components/List'
import { useNavigation } from '@react-navigation/native'
import { EditToggleButton } from '@/components/Button/EditToggleButton'
import { sampleProfile } from '@/redux/modules/printer/utils/sample'
import { selectPrinterSubmissions } from '@/redux/modules/printer/selectors'
import { Profile, Submission } from '@/redux/modules/printer/utils'

type Props = {}
type ComponentProps = Props & {
  submissions: Submission[]
  onPressSample: () => void
  onPressPrinter: (obj: Profile) => void
}

const Component: React.FC<ComponentProps> = ({
  submissions,
  onPressSample,
  onPressPrinter,
}) => {
  const styles = useStyles()

  return (
    <ScrollView style={styles.scrollView}>
      <Section title="サンプルを印刷する">
        <Cell title="サンプル" onPress={onPressSample} />
      </Section>
      <Section title="プロフィールを印刷する">
        {submissions.map(({ title, profile, uuid }) => {
          return (
            <Cell
              title={title}
              onPress={() => onPressPrinter(profile)}
              key={uuid}
            />
          )
        })}
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
      title: 'モバイルプリンター',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <EditToggleButton isEditable={isEditable} toggle={toggle} />
      ),
    })
  }, [navigation, isEditable, toggle])

  const onPressSample = useCallback(() => {
    dispatch(print(sampleProfile))
  }, [dispatch])

  const onPressPrinter = useCallback(
    (profile: Profile) => {
      dispatch(print(profile))
    },
    [dispatch],
  )

  return (
    <Component {...props} {...{ submissions, onPressSample, onPressPrinter }} />
  )
}

export { Container as Home }

const useStyles = makeStyles(() => ({
  scrollView: styleType<ViewStyle>({
    flex: 1,
  }),
}))
