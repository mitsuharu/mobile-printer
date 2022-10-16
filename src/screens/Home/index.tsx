import { Button } from '@/components/Button';
import React, { useCallback } from 'react';
import {
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { useDispatch } from 'react-redux';
import { print } from '@/redux/modules/printer/slice';
import { sampleProfile } from '@/redux/modules/printer/utils';

type Props = {

}
type ComponentProps = Props & {
  onPress: () => void
}

const Component: React.FC<ComponentProps> = ({onPress}) => {

  const styles = useStyles()

  return <View style={styles.container}>
    <Button onPress={onPress} text="サンプルを印刷する" textStyle={styles.text}/>
  </View>
}

const Container: React.FC<Props> = (props) => {
  const dispatch = useDispatch()

  const onPress = useCallback(() => {
    dispatch(print(sampleProfile))
  }, [dispatch])

  return <Component {...props} onPress={onPress}/>
}

export { Container as Home}


const useStyles = makeStyles( () => ({
  container: styleType<ViewStyle>({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  text: styleType<TextStyle>({
    fontSize: 32
  })
}))
