import React, { ReactNode } from 'react'
import {
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import { Button } from '@/components/Button'
import { contentInset } from '@/components/List/util'
import { COLOR } from '@/CONSTANTS/COLOR'
import Icon from 'react-native-vector-icons/AntDesign'
import { Size } from '@/utils/types'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'

const AccessorySize: Size = { width: 20, height: 20 }
type AccessoryType = undefined | 'disclosure' | 'link' | 'check' | 'switch'

type ContentProps = Partial<{ title: string; children: ReactNode }>
type AccessoryProps = Partial<{
  accessory: AccessoryType
  accessoryStyle: StyleProp<TextStyle>
  switchValue: boolean
  onSwitchValueChange: (value: boolean) => void
}>

export type Props = ContentProps &
  AccessoryProps & {
    subtitle?: string
    description?: string
    onPress?: () => void
    onLongPress?: () => void

    /**
     * titleとsubtitleを横に並べるならtrue。デフォルトはfalse。
     */
    isRowDirection?: boolean

    style?: StyleProp<ViewStyle>
    titleStyle?: StyleProp<TextStyle>
    subtitleStyle?: StyleProp<TextStyle>

    inactive?: boolean
  }

const AccessoryView: React.FC<AccessoryProps> = ({
  accessory,
  accessoryStyle,
  switchValue,
  onSwitchValueChange,
}) => {
  switch (accessory) {
    case 'disclosure':
      return <Icon name="right" size={16} style={accessoryStyle} />
    case 'check':
      return <Icon name="check" size={16} style={accessoryStyle} />
    case 'link':
      return <Icon name="link" size={16} style={accessoryStyle} />
    case 'switch':
      return (
        <Switch
          ios_backgroundColor="#3e3e3e"
          value={switchValue}
          onValueChange={onSwitchValueChange}
        />
      )
    default:
      return null
  }
}

const Component: React.FC<Props> = ({
  title,
  children,
  subtitle,
  description,
  onPress,
  onLongPress,
  style,
  titleStyle,
  subtitleStyle,
  isRowDirection,
  accessory,
  accessoryStyle,
  switchValue,
  onSwitchValueChange,
  inactive,
}) => {
  const styles = useStyles()

  return (
    <Button
      style={[styles.container, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      inactive={inactive}
    >
      {!!children && children}
      <View style={styles.row}>
        {!!title && (
          <View style={isRowDirection ? styles.innerRow : styles.innerColumn}>
            {!!subtitle && (
              <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
            )}
            <Text style={[styles.text, titleStyle]}>{title}</Text>
            {!!description && (
              <Text style={[styles.subtitle, subtitleStyle]}>
                {description}
              </Text>
            )}
          </View>
        )}
        <AccessoryView
          accessory={accessory}
          accessoryStyle={[styles.accessoryStyle, accessoryStyle]}
          switchValue={switchValue}
          onSwitchValueChange={onSwitchValueChange}
        />
      </View>
    </Button>
  )
}

export { Component as Cell }

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      minHeight: Math.max(
        44,
        AccessorySize.height + contentInset.top + contentInset.bottom,
      ),
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
      justifyContent: 'center',
    }),
    row: styleType<ViewStyle>({
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingTop: contentInset.top,
      paddingBottom: contentInset.bottom,
      paddingLeft: contentInset.left,
      paddingRight: contentInset.right,
    }),
    innerColumn: styleType<ViewStyle>({
      flex: 1,
      flexDirection: 'column',
    }),
    innerRow: styleType<ViewStyle>({
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }),
    accessoryStyle: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    text: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.PRIMARY,
      fontSize: 15,
      lineHeight: 22,
    }),
    subtitle: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
      fontSize: 13,
      lineHeight: 19,
      paddingRight: 6,
    }),
  })
  return styles
})
