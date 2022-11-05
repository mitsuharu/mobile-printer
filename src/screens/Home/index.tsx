import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  ViewStyle,
  ScrollView,
} from 'react-native';
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch } from 'react-redux';
import { print } from '@/redux/modules/printer/slice';
import { sampleProfile } from '@/redux/modules/printer/utils';
import { Cell, Section } from '@/components/List';
import { casualProfile, formalProfile } from '@/CONSTANTS/PROFILE';
import { useNavigation } from '@react-navigation/native';
import { EditToggleButton } from '@/components/Button/EditToggleButton';

type Props = {
}
type ComponentProps = Props & {
  onPressSample: () => void
  onPressFormals: () => void
  onPressCasuals: () => void
}

const Component: React.FC<ComponentProps> = ({onPressSample, onPressFormals, onPressCasuals}) => {
  const styles = useStyles()

  


  return (
  <ScrollView style ={styles.scrollView}>
    <Section title='サンプル' >
      <Cell title='サンプル' onPress={onPressSample} />
    </Section>
    <Section title='プロフィール' >
      <Cell title='フォーマル' onPress={onPressFormals} />
      <Cell title='カジュアル' onPress={onPressCasuals} />
    </Section>
  </ScrollView>
  )
}

const Container: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const [isEditable, setIsEditable] = useState<boolean>(false)

  const toggle = useCallback(()=>{
    setIsEditable(!isEditable)
  }, [isEditable, setIsEditable])


  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'モバイルプリンター',
      headerRight: () => <EditToggleButton isEditable={isEditable} toggle={toggle} />,
    })
  }, [navigation, isEditable])

  const onPressSample = useCallback(() => {
    dispatch(print(sampleProfile))
  }, [dispatch])

  const onPressFormals = useCallback(() => {
    dispatch(print(formalProfile))
  }, [dispatch])

  const onPressCasuals= useCallback(() => {
    dispatch(print(casualProfile))
  }, [dispatch])

  return <Component {...props} {...{onPressSample, onPressFormals, onPressCasuals}}/>
}

export { Container as Home}


const useStyles = makeStyles( () => ({
  scrollView: styleType<ViewStyle>({
    flex: 1,
  }),
}))
