import React, { useCallback, useEffect } from 'react'
import { Cell, Section } from '../List'
import { useSelector, useDispatch } from 'react-redux'
import { selectAsciiArtSeasonalEvent } from '@/redux/modules/asciiArt/selectors'
import {
  SeasonalEvent,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  printAsciiArtSnow,
  updateSeasonalEvent,
} from '@/redux/modules/asciiArt/slice'

type Props = {}
type ComponentProps = Props & {
  seasonalEvent: SeasonalEvent
  onPressChristmas: () => void
  onPressSnow: () => void
  onPressNewYear: () => void
}

const Component: React.FC<ComponentProps> = ({
  seasonalEvent,
  onPressChristmas,
  onPressSnow,
  onPressNewYear,
}) => {
  return (
    <Section title="Happy Day!">
      {seasonalEvent === 'christmas' && (
        <>
          <Cell title="Christmas" onPress={onPressChristmas} />
          <Cell title="Snow" onPress={onPressSnow} />
        </>
      )}
      {seasonalEvent === 'newYear' && (
        <Cell title="New Year" onPress={onPressNewYear} />
      )}
    </Section>
  )
}

const Container: React.FC<Props> = (props) => {
  const dispatch = useDispatch()
  const seasonalEvent: SeasonalEvent = useSelector(selectAsciiArtSeasonalEvent)

  useEffect(() => {
    dispatch(updateSeasonalEvent())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPressChristmas = useCallback(() => {
    dispatch(printAsciiArtChristmas())
  }, [dispatch])

  const onPressNewYear = useCallback(() => {
    dispatch(printAsciiArtNewYear())
  }, [dispatch])

  const onPressSnow = useCallback(() => {
    dispatch(printAsciiArtSnow())
  }, [dispatch])

  return seasonalEvent !== 'none' ? (
    <Component
      {...props}
      {...{
        seasonalEvent,
        onPressChristmas,
        onPressNewYear,
        onPressSnow,
      }}
    />
  ) : null
}

export { Container as SeasonalAsciiArtSection }
