import type { RootState } from '@/redux/RootState'

export const selectDatabaseIsReady = (state: RootState): boolean =>
  state.database.isReady
