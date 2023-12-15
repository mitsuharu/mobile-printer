import React, { useCallback, useEffect } from 'react'
import { Cell, Section } from '../List'
import { useSelector, useDispatch } from 'react-redux'
import { selectAsciiArtSeasonalEvent } from '@/redux/modules/asciiArt/selectors'
import {
  SeasonalEvent,
  printAsciiArt,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  printAsciiArtSnow,
  updateSeasonalEvent,
} from '@/redux/modules/asciiArt/slice'

type Props = {}
type ComponentProps = Props & {
  seasonalEvent: SeasonalEvent
  onPressAsciiArt: () => void
  onPressChristmas: () => void
  onPressSnow: () => void
  onPressNewYear: () => void
}

const Component: React.FC<ComponentProps> = ({
  onPressAsciiArt,
  onPressChristmas,
  onPressSnow,
  onPressNewYear,
}) => {
  return (
    <Section title="Happy Day!">
      <Cell title="Christmas" onPress={onPressChristmas} />
      <Cell title="Snow" onPress={onPressSnow} />
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

  const onPressSnow = useCallback(() => {
    dispatch(printAsciiArtSnow())
  }, [dispatch])

  return (
    <Component
      {...props}
      {...{
        seasonalEvent,
        onPressChristmas,
        onPressNewYear,
        onPressAsciiArt,
        onPressSnow,
      }}
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
