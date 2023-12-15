import { RootState } from '@/redux/RootState'
import { SeasonalEvent } from './slice'

export const selectAsciiArtUpdatedAt = (state: RootState): number =>
  state.asciiArt.updatedAt

export const selectAsciiArtSeasonalEvent = (state: RootState): SeasonalEvent =>
  state.asciiArt.seasonalEvent

export const selectAsciiArtIsSeasonalEvent = (state: RootState): boolean =>
  state.asciiArt.seasonalEvent !== 'none'
