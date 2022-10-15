import React, { useMemo, Children } from 'react'
import { ItemSeparator } from '@/components/List/Separator'
import { View } from 'react-native'

type Props = {
  children?: React.ReactNode
}
type ComponentProps = Props & {
  cells: JSX.Element[]
}

const Component: React.FC<ComponentProps> = ({ cells }) => {
  return <>{cells}</>
}

/**
 * Cell間に罫線を引く
 */
const Container: React.FC<Props> = (props) => {
  const { children } = props

  // false や null な children を取り除く
  const nonNullChildren = useMemo(
    () => Children.toArray(children).filter(Boolean),
    [children],
  )
  const childrenCount = useMemo(() => nonNullChildren.length, [nonNullChildren])
  const cells = useMemo(
    () =>
      nonNullChildren.map((child, index) => {
        const key = `${child}_${index}`
        return (
          <View key={key}>
            {child}
            {!!child && index !== childrenCount - 1 && <ItemSeparator />}
          </View>
        )
      }),
    [nonNullChildren, childrenCount],
  )

  return <Component {...props} cells={cells} />
}

export { Container as CellGroup }
