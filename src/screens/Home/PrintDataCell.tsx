import type React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { COLOR, ICON } from '@/CONSTANTS'
import { Button } from '@/components/Button'
import { contentInset } from '@/components/List/util'
import type { PrintData } from '@/print'
import { styleType } from '@/utils/styles'

type Props = {
  printData: PrintData
  layoutName?: string
  onPressPrint: (printData: PrintData) => void
  onPressEdit: (printData: PrintData) => void
  onLongPress: (printData: PrintData) => void
}

/**
 * ホームに並べる印刷データ
 *
 * 本体をタップすると印刷し、右のボタンから内容の編集へ進む。
 * 編集を階層の奥に置くと、印刷内容を直すたびに何度もたどることになる。
 * 長押しすると複製と削除ができる。レイアウトの一覧と同じ操作にしている。
 */
export const PrintDataCell: React.FC<Props> = ({
  printData,
  layoutName,
  onPressPrint,
  onPressEdit,
  onLongPress,
}) => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <Button
        style={styles.content}
        onPress={() => onPressPrint(printData)}
        onLongPress={() => onLongPress(printData)}
      >
        {/*
          レイアウトの一覧と行の形が同じため、印刷データであることを
          アイコンで示す。一覧のセル（`List/Cell`）と同じ位置・大きさに置く。
        */}
        <AntDesignIcon
          name={ICON.PRINT_DATA}
          size={18}
          style={styles.typeIcon}
        />
        <View style={styles.text}>
          <Text style={styles.title}>{printData.title}</Text>
          {!!layoutName && <Text style={styles.subtitle}>{layoutName}</Text>}
        </View>
      </Button>
      <Pressable
        style={styles.edit}
        onPress={() => onPressEdit(printData)}
        accessibilityLabel={`${printData.title}を編集する`}
        accessibilityRole="button"
        hitSlop={8}
      >
        <Icon name="edit" size={22} style={styles.editIcon} />
      </Pressable>
    </View>
  )
}

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
      paddingLeft: contentInset.left,
      paddingRight: 8,
      backgroundColor: COLOR(colorScheme).BACKGROUND.PRIMARY,
    }),
    content: styleType<ViewStyle>({
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: contentInset.top,
    }),
    typeIcon: styleType<TextStyle>({
      width: 22,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    text: styleType<ViewStyle>({
      flex: 1,
      justifyContent: 'center',
    }),
    title: styleType<TextStyle>({
      fontSize: 16,
      color: COLOR(colorScheme).TEXT.PRIMARY,
    }),
    subtitle: styleType<TextStyle>({
      fontSize: 12,
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
    edit: styleType<ViewStyle>({
      paddingHorizontal: 12,
      paddingVertical: 12,
    }),
    editIcon: styleType<TextStyle>({
      color: COLOR(colorScheme).TEXT.SECONDARY,
    }),
  })
  return styles
})
