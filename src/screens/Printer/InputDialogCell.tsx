import type React from 'react'
import { useCallback, useState } from 'react'
import { InputDialog } from '@/components/Dialog'
import { Cell } from '@/components/List'

type Props = {
  title: string
  dialogTitle?: string
  dialogDescription?: string
  onSelectText?: (text: string) => void
  inactive?: boolean
}

export const InputDialogCell: React.FC<Props> = ({
  title,
  dialogTitle,
  dialogDescription,
  onSelectText,
  inactive,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const onPressCell = useCallback(() => {
    setIsVisible(true)
  }, [])

  const onPressDialog = useCallback(
    (text: string) => {
      setIsVisible(false)
      onSelectText?.(text)
    },
    [onSelectText],
  )

  const onCancelDialog = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <>
      <Cell title={title} onPress={() => onPressCell()} inactive={inactive} />
      <InputDialog
        isVisible={isVisible}
        title={dialogTitle}
        description={dialogDescription}
        onPress={onPressDialog}
        onCancel={onCancelDialog}
      />
    </>
  )
}
