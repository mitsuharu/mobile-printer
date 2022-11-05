import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

type Props = Pick<ViewStyle, 'width' | 'height'>

export const Spacer: React.FC<Props> = ({ width, height }) => {
  const style: ViewStyle = { width, height, backgroundColor: 'transparent' }
  return <View style={style} />
}

export const SpacerLine: React.FC<Props> = ({ width, height }) => {
  const style: ViewStyle = {
    width,
    height,
    backgroundColor: 'transparent',
    alignContent: 'center',
    justifyContent: 'center',
  }
  const hairline: ViewStyle = {
    backgroundColor: 'gray',
    height: StyleSheet.hairlineWidth,
  }
  return (
    <View style={style}>
      <View style={hairline} />
    </View>
  )
}
