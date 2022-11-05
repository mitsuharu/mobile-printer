import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Button } from './index'

type Props = {
  isEditable: boolean
  toggle: () => void
}
type ComponentProps = Props & {}

const Component: React.FC<ComponentProps> = ({ isEditable, toggle }) => {
  return (
    <Button onPress={toggle}>
      {isEditable ? (
        <Icon name="edit" size={24} />
      ) : (
        <Icon name="edit-off" size={24} />
      )}
    </Button>
  )
}

const Container: React.FC<Props> = (props) => {
  return <Component {...props} />
}

export { Container as EditToggleButton }
