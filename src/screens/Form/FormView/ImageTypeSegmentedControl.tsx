import type { PrintImageType } from '@mitsuharu/react-native-sunmi-printer-library'
import SegmentedControl, {
  type NativeSegmentedControlIOSChangeEvent,
  type SegmentedControlProps,
} from '@react-native-segmented-control/segmented-control'
import type React from 'react'
import { useCallback, useMemo, useState } from 'react'
import {
  type NativeSyntheticEvent,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
} from 'react-native'
import { makeStyles } from 'react-native-swag-styles'
import { COLOR } from '@/CONSTANTS'
import { styleType } from '@/utils/styles'

type Props = {
  initialPrintImageType?: PrintImageType
  enabled?: boolean
  onChange?: (printImageType: PrintImageType) => void
}

// The library's NativeMethods class intersection is not recognized as JSX by React 19 types.
const SegmentedControlView =
  SegmentedControl as unknown as React.ComponentType<SegmentedControlProps>

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
    <SegmentedControlView
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
