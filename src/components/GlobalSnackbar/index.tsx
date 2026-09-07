import type React from 'react'
import { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { Snackbar } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'
import { selectSnackbarItem } from '@/redux/modules/snackbar/selectors'
import {
  dequeueSnackbar,
  type SnackbarItem,
} from '@/redux/modules/snackbar/slice'
import { styleType } from '@/utils/styles'

/**
 * SnackBar の表示秒数(ミリ秒)
 */
export const SNACKBAR_DURATION = 2000

type ComponentProps = {
  item?: SnackbarItem
  onDismiss: () => void
}

const Component: React.FC<ComponentProps> = ({ item, onDismiss }) => (
  <Snackbar
    visible={!!item}
    onDismiss={onDismiss}
    duration={SNACKBAR_DURATION}
    wrapperStyle={styles.snackbarWrapper}
    style={styles.snackbar}
  >
    {item?.message}
  </Snackbar>
)

export const GlobalSnackbar: React.FC = () => {
  const dispatch = useDispatch()
  const item: SnackbarItem | undefined = useSelector(selectSnackbarItem)

  const onDismiss = useCallback(() => {
    if (item) {
      dispatch(dequeueSnackbar({ createdAt: item.createdAt }))
    }
  }, [dispatch, item])

  return <Component item={item} onDismiss={onDismiss} />
}

const styles = StyleSheet.create({
  snackbarWrapper: styleType({
    // top: 0,
  }),
  snackbar: styleType({
    elevation: 0,
    marginHorizontal: 8,
    borderRadius: 8,
    opacity: 0.95,
    minHeight: 48,
  }),
})
