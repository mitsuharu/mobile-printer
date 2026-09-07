import dayjs from 'dayjs'
import { createUUID } from '@/utils/uuid'
import type { Submission } from './types'

export * from './preset'
export * from './sample'
export * from './types'

export const isEqualToSubmission = (a: Submission, b: Submission) =>
  a.uuid === b.uuid

export const createSubmission = (): Submission => {
  const createdAt = dayjs().valueOf()
  const value: Submission = {
    title: '',
    profile: { name: '' },
    createdAt: createdAt,
    updatedAt: createdAt,
    uuid: createUUID(),
  }
  return value
}
