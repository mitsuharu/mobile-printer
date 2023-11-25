import { InputDialog } from '@/components/Dialog'
import { Cell } from '@/components/List'
import React, { useCallback, useState } from 'react'

type Props = {
  title: string
  dialogTitle?: string
  dialogDescription?: string
  onSelectText?: (text: string) => void
}

export const InputDialogCell: React.FC<Props> = ({
  title,
  dialogTitle,
  dialogDescription,
  onSelectText,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const onPressCell = useCallback(() => {
    setIsVisible(true)
  }, [setIsVisible])

  const onPressDialog = useCallback(
    (text: string) => {
      setIsVisible(false)
      onSelectText?.(text)
    },
    [onSelectText, setIsVisible],
  )

  const onCancelDialog = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  return (
    <>
      <Cell title={title} onPress={() => onPressCell()} />
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
