import { takeEvery } from 'redux-saga/effects'
import {
  printAsciiArt,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  printAsciiArtSnow,
  updateSeasonalEvent,
} from '../slice'
import { printAsciiArtSage } from './printAsciiArt'
import { printAsciiArtChristmasSage } from './printAsciiArtChristmas'
import { printAsciiArtNewYearSage } from './printAsciiArtNewYear'
import { printAsciiArtSnowSage } from './printAsciiArtSnow'
import { updateSeasonalEventSaga } from './updateSeasonalEvent'

export function* asciiArtSaga() {
  yield takeEvery(updateSeasonalEvent, updateSeasonalEventSaga)
  yield takeEvery(printAsciiArt, printAsciiArtSage)
  yield takeEvery(printAsciiArtChristmas, printAsciiArtChristmasSage)
  yield takeEvery(printAsciiArtNewYear, printAsciiArtNewYearSage)
  yield takeEvery(printAsciiArtSnow, printAsciiArtSnowSage)
}
