import { isChristmasDuration, isNewYearDuration } from '@/utils/day'
import { put } from 'redux-saga/effects'
import { SeasonalEvent, assignSeasonalEvent } from '../slice'

/**
 * @package
 */
export function* confirmSeasonalEventSaga() {
  try {
    // selectAsciiArtUpdatedAt で一定時間以上すぎてたら、更新する

    const seasonalEvent = getSeasonalEventOnToday()
    yield put(assignSeasonalEvent(seasonalEvent))
  } catch (error: any) {
    console.warn(error.message)
  }
}

function getSeasonalEventOnToday(): SeasonalEvent {
  try {
    const isChristmas: boolean = isChristmasDuration()
    if (isChristmas) {
      return 'christmas'
    }

    const isNewYear: boolean = isNewYearDuration()
    if (isNewYear) {
      return 'newYear'
    }

    return 'none'
  } catch (error: any) {
    console.warn(error.message)
    return 'none'
  }
}
