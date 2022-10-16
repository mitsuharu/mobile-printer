import React from 'react'
import { View, ViewStyle } from 'react-native'

type Props = {
  width?: number
  height?: number
}

export const Spacer: React.FC<Props> = ({ width, height }) => {
  const style: ViewStyle = { width, height, backgroundColor: 'transparent' }
  return <View style={style} />
}
