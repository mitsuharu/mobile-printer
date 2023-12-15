import React, { useCallback, useEffect } from 'react'
import { Cell, Section } from '../List'
import { useSelector, useDispatch } from 'react-redux'
import { selectAsciiArtSeasonalEvent } from '@/redux/modules/asciiArt/selectors'
import {
  SeasonalEvent,
  printAsciiArt,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  updateSeasonalEvent,
} from '@/redux/modules/asciiArt/slice'

type Props = {}
type ComponentProps = Props & {
  seasonalEvent: SeasonalEvent
  onPressAsciiArt: () => void
  onPressChristmas: () => void
  onPressNewYear: () => void
}

const Component: React.FC<ComponentProps> = ({
  onPressAsciiArt,
  onPressChristmas,
  onPressNewYear,
}) => {
  return (
    <Section title="Happy Day!">
      <Cell title="Christmas" onPress={onPressChristmas} />
      <Cell title="New Year" onPress={onPressNewYear} />
      <Cell title="Ascii Art" onPress={onPressAsciiArt} />
    </Section>
  )
}

const Container: React.FC<Props> = (props) => {
  const dispatch = useDispatch()
  const seasonalEvent: SeasonalEvent = useSelector(selectAsciiArtSeasonalEvent)

  useEffect(() => {
    console.log(`AsciiArtSection#useEffect`)
    dispatch(updateSeasonalEvent())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPressChristmas = useCallback(() => {
    dispatch(printAsciiArtChristmas())
  }, [dispatch])

  const onPressNewYear = useCallback(() => {
    dispatch(printAsciiArtNewYear())
  }, [dispatch])

  const onPressAsciiArt = useCallback(() => {
    dispatch(printAsciiArt())
  }, [dispatch])

  return (
    <Component
      {...props}
      {...{ seasonalEvent, onPressChristmas, onPressNewYear, onPressAsciiArt }}
    />
  )

  // return seasonalEvent !== 'none' ? (
  //   <Component
  //     {...props}
  //     {...{ seasonalEvent, onPressChristmas, onPressNewYear }}
  //   />
  // ) : null
}

export { Container as SeasonalAsciiArtSection }
