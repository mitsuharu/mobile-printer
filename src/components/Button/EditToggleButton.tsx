import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Button } from './index'

type Props = {
  isEditable: boolean
  toggle: () => void
}
type ComponentProps = Props & {
  iconName: string
}

const Component: React.FC<ComponentProps> = ({ iconName, toggle }) => {
  return (
    <Button onPress={toggle}>
      <Icon name={iconName} size={24} />
    </Button>
  )
}

const Container: React.FC<Props> = (props) => {
  const { isEditable } = props

  const iconName = isEditable ? 'edit-off' : 'edit'

  return <Component {...props} iconName={iconName} />
}

export { Container as EditToggleButton }
