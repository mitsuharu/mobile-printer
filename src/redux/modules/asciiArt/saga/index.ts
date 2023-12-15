import { takeEvery } from 'redux-saga/effects'
import {
  printAsciiArt,
  printAsciiArtChristmas,
  printAsciiArtNewYear,
  updateSeasonalEvent,
} from '../slice'
import { updateSeasonalEventSaga } from './updateSeasonalEvent'
import { printAsciiArtChristmasSage } from './printAsciiArtChristmas'
import { printAsciiSage } from './printAsciiArt'
import { printAsciiArtNewYearSage } from './printAsciiArtNewYear'

export function* asciiArtSaga() {
  yield takeEvery(updateSeasonalEvent, updateSeasonalEventSaga)
  yield takeEvery(printAsciiArt, printAsciiSage)
  yield takeEvery(printAsciiArtChristmas, printAsciiArtChristmasSage)
  yield takeEvery(printAsciiArtNewYear, printAsciiArtNewYearSage)
}
