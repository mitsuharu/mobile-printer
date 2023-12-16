import { takeEvery } from 'redux-saga/effects'
import {
  printAsciiArt,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  printAsciiArtSnow,
  updateSeasonalEvent,
} from '../slice'
import { updateSeasonalEventSaga } from './updateSeasonalEvent'
import { printAsciiArtChristmasSage } from './printAsciiArtChristmas'
import { printAsciiArtSage } from './printAsciiArt'
import { printAsciiArtNewYearSage } from './printAsciiArtNewYear'
import { printAsciiArtSnowSage } from './printAsciiArtSnow'

export function* asciiArtSaga() {
  yield takeEvery(updateSeasonalEvent, updateSeasonalEventSaga)
  yield takeEvery(printAsciiArt, printAsciiArtSage)
  yield takeEvery(printAsciiArtChristmas, printAsciiArtChristmasSage)
  yield takeEvery(printAsciiArtNewYear, printAsciiArtNewYearSage)
  yield takeEvery(printAsciiArtSnow, printAsciiArtSnowSage)
}
