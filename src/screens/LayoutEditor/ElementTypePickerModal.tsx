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
import type { LayoutElementType } from '@/print'
import { styleType } from '@/utils/styles'
import { addableElementTypes, describeElementType } from './describeElement'

type Props = {
  visible: boolean
  onSelect: (type: LayoutElementType) => void
  onCancel: () => void
}

/**
 * 追加する要素の種類を選ぶ
 *
 * @note
 * AndroidのAlertは3つまでしかボタンを表示できず、選択肢が切り捨てられる。
 * そのため一覧を持つモーダルで選ばせる。
 */
export const ElementTypePickerModal: React.FC<Props> = ({
  visible,
  onSelect,
  onCancel,
}) => {
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
          <Text style={styles.title}>要素の追加</Text>
          <ScrollView style={styles.list}>
            {addableElementTypes.map((type) => (
              <Cell
                key={type}
                title={describeElementType(type)}
                onPress={() => onSelect(type)}
                accessory="disclosure"
              />
            ))}
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
      paddingVertical: 16,
      fontSize: 18,
      fontWeight: 'bold',
      color: COLOR(colorScheme).TEXT.PRIMARY,
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
