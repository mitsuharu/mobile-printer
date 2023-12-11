import React, { useCallback, useMemo, useState } from 'react'
import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from '@react-native-segmented-control/segmented-control'
import {
  NativeSyntheticEvent,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native'
import { PrintImageType } from '@mitsuharu/react-native-sunmi-printer-library'
import { makeStyles } from 'react-native-swag-styles'
import { styleType } from '@/utils/styles'
import { COLOR } from '@/CONSTANTS'

type Props = {
  initialPrintImageType?: PrintImageType
  enabled?: boolean
  onChange?: (printImageType: PrintImageType) => void
}

export const PrintImageTypeSegmentedControl: React.FC<Props> = ({
  initialPrintImageType,
  enabled,
  onChange,
}) => {
  const styles = useStyles()
  const values: PrintImageType[] = useMemo(() => ['binary', 'grayscale'], [])

  const [selectedIndex, setSelectedIndex] = useState<number>(() =>
    initialPrintImageType ? values.indexOf(initialPrintImageType) : 0,
  )

  const onChangeSegmentedControl = useCallback(
    (e: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
      const nextIndex = e.nativeEvent.selectedSegmentIndex
      setSelectedIndex(nextIndex)
      onChange?.(values[nextIndex])
    },
    [onChange, values],
  )

  return (
    <SegmentedControl
      values={values}
      selectedIndex={selectedIndex}
      onChange={onChangeSegmentedControl}
      enabled={enabled}
      style={styles.container}
    />
  )
}

const useStyles = makeStyles(useColorScheme, (colorScheme) => {
  const styles = StyleSheet.create({
    container: styleType<ViewStyle>({
      borderColor: COLOR(colorScheme).TEXT.SECONDARY,
      borderWidth: StyleSheet.hairlineWidth,
    }),
  })
  return styles
})
