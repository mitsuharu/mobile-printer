import type React from 'react'
import { useCallback, useState } from 'react'
import type { KeyboardTypeOptions } from 'react-native'
import { InputDialog } from '@/components/Dialog'
import { Cell } from '@/components/List'

type Props = {
  title: string

  /**
   * 入力欄に入れる値
   */
  value: string

  /**
   * セルに表示する文字
   *
   * 単位を添えるなど、表示と入力を分けたいときに使う。省略すると値をそのまま表示する。
   */
  displayValue?: string

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
  displayValue,
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
        description={
          value === '' ? (placeholder ?? '（未設定）') : (displayValue ?? value)
        }
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
