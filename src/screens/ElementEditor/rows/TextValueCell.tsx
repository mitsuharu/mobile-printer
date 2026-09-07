import type React from 'react'
import { useCallback, useState } from 'react'
import type { KeyboardTypeOptions } from 'react-native'
import { InputDialog } from '@/components/Dialog'
import { Cell } from '@/components/List'

type Props = {
  title: string
  value: string
  placeholder?: string
  dialogDescription?: string
  keyboardType?: KeyboardTypeOptions
  onChange: (value: string) => void
}

/**
 * タップして文字を入れ直すセル
 */
export const TextValueCell: React.FC<Props> = ({
  title,
  value,
  placeholder,
  dialogDescription,
  keyboardType,
  onChange,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const onPress = useCallback(() => setIsVisible(true), [])
  const onCancel = useCallback(() => setIsVisible(false), [])
  const onSubmit = useCallback(
    (next: string) => {
      setIsVisible(false)
      onChange(next)
    },
    [onChange],
  )

  return (
    <>
      <Cell
        title={title}
        description={value === '' ? (placeholder ?? '（未設定）') : value}
        onPress={onPress}
      />
      <InputDialog
        isVisible={isVisible}
        title={title}
        description={dialogDescription}
        defaultValue={value}
        keyboardType={keyboardType}
        onPress={onSubmit}
        onCancel={onCancel}
      />
    </>
  )
}
