import type React from 'react'
import { useCallback } from 'react'
import { TextValueCell } from './TextValueCell'

type Props = {
  title: string
  value: number
  unit?: string
  min: number
  max: number
  onChange: (value: number) => void
}

/**
 * タップして数値を入れ直すセル
 *
 * 範囲の外や数値でない入力は捨てて、元の値を保つ。
 */
export const NumberValueCell: React.FC<Props> = ({
  title,
  value,
  unit,
  min,
  max,
  onChange,
}) => {
  const onChangeText = useCallback(
    (text: string) => {
      const next = Number(text.trim())
      if (!Number.isFinite(next) || !Number.isInteger(next)) {
        return
      }
      if (next < min || next > max) {
        return
      }
      onChange(next)
    },
    [max, min, onChange],
  )

  return (
    <TextValueCell
      title={title}
      value={`${value}${unit ?? ''}`}
      dialogDescription={`${min}〜${max} の数値を入力してください`}
      keyboardType="number-pad"
      onChange={onChangeText}
    />
  )
}
