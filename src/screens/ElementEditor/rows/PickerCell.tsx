import type React from 'react'
import { useCallback, useState } from 'react'
import { Cell } from '@/components/List'
import {
  type ListPickerItem,
  ListPickerModal,
} from '@/components/Modal/ListPickerModal'

type Props<T> = {
  title: string
  value: T
  items: ListPickerItem<T>[]
  onChange: (value: T) => void
}

/**
 * タップして一覧から選び直すセル
 */
export const PickerCell = <T,>({
  title,
  value,
  items,
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
        items={items}
        selected={value}
        onSelect={onSelect}
        onCancel={() => setIsVisible(false)}
      />
    </>
  )
}
