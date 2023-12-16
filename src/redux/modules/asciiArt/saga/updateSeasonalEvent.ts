import {
  isChristmasDuration,
  isMoreThanOneDay,
  isNewYearDuration,
} from '@/utils/day'
import { put, select } from 'redux-saga/effects'
import { SeasonalEvent, assignSeasonalEvent } from '../slice'
import { selectAsciiArtUpdatedAt } from '../selectors'

/**
 * @package
 */
export function* updateSeasonalEventSaga() {
  try {
    // 前回の取得時間から日が変わったか判定する
    const updatedAt: number = yield select(selectAsciiArtUpdatedAt)
    const needUpdate = isMoreThanOneDay(updatedAt)
    if (needUpdate) {
      const seasonalEvent = getSeasonalEventOnToday()
      yield put(assignSeasonalEvent(seasonalEvent))
    }
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
