import type React from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR, MESSAGE } from '@/CONSTANTS'
import { Button } from '@/components/Button'
import { Cell } from '@/components/List'
import { styleType } from '@/utils/styles'

export type ListPickerItem<T> = {
  value: T
  title: string
  description?: string
}

/**
 * 一覧の末尾に置く操作
 *
 * 選択肢そのものを増やしたいときに使う。
 */
export type ListPickerAction = {
  title: string
  description?: string
  onPress: () => void
}

type Props<T> = {
  visible: boolean
  title: string

  /**
   * 一覧の上に添える説明
   */
  description?: string

  items: ListPickerItem<T>[]
  selected?: T
  action?: ListPickerAction
  onSelect: (value: T) => void
  onCancel: () => void
}

/**
 * 一覧から1つ選ぶモーダル
 *
 * @note
 * AndroidのAlertは3つまでしかボタンを表示できず、選択肢が切り捨てられる。
 * 選択肢が4つ以上になり得るものは、このモーダルで選ばせる。
 */
export const ListPickerModal = <T,>({
  visible,
  title,
  description,
  items,
  selected,
  action,
  onSelect,
  onCancel,
}: Props<T>): React.ReactElement => {
  const styles = useStyles()

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          {!!description && (
            <Text style={styles.description}>{description}</Text>
          )}
          <ScrollView style={styles.list}>
            {items.map((item) => (
              <Cell
                key={String(item.value)}
                title={item.title}
                description={item.description}
                onPress={() => onSelect(item.value)}
                accessory={item.value === selected ? 'check' : undefined}
              />
            ))}
            {!!action && (
              <Cell
                title={action.title}
                description={action.description}
                onPress={action.onPress}
              />
            )}
          </ScrollView>
          <Button
            onPress={onCancel}
            text={MESSAGE.CANCEL}
            style={styles.buttonView}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    }),
    modal: styleType<ViewStyle>({
      width: '85%',
      maxHeight: '70%',
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    }),
    title: styleType<TextStyle>({
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      fontSize: 18,
      fontWeight: 'bold',
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    description: styleType<TextStyle>({
      paddingHorizontal: 16,
      paddingBottom: 8,
      fontSize: 12,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    list: styleType<ViewStyle>({
      flexGrow: 0,
    }),
    buttonView: styleType<ViewStyle>({
      paddingVertical: 16,
      alignItems: 'center',
    }),
    buttonText: styleType<TextStyle>({
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
  })
  return styles
})
