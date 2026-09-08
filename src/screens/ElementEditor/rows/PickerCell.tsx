import type React from 'react'
import { useCallback, useState } from 'react'
import { Cell } from '@/components/List'
import {
  type ListPickerAction,
  type ListPickerItem,
  ListPickerModal,
} from '@/components/Modal/ListPickerModal'

type Props<T> = {
  title: string
  description?: string
  value: T
  items: ListPickerItem<T>[]

  /**
   * 一覧の末尾に置く操作
   */
  action?: ListPickerAction

  onChange: (value: T) => void
}

/**
 * タップして一覧から選び直すセル
 */
export const PickerCell = <T,>({
  title,
  description,
  value,
  items,
  action,
  onChange,
}: Props<T>): React.ReactElement => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const onSelect = useCallback(
    (next: T) => {
      setIsVisible(false)
      onChange(next)
    },
    [onChange],
  )

  return (
    <>
      <Cell
        title={title}
        description={
          items.find((item) => item.value === value)?.title ?? '（未設定）'
        }
        onPress={() => setIsVisible(true)}
      />
      <ListPickerModal
        visible={isVisible}
        title={title}
        description={description}
        items={items}
        selected={value}
        action={
          action && {
            ...action,
            onPress: () => {
              setIsVisible(false)
              action.onPress()
            },
          }
        }
        onSelect={onSelect}
        onCancel={() => setIsVisible(false)}
      />
    </>
  )
}
