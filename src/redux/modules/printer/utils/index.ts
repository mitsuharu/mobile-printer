import { createUUID } from '@/utils/uuid'
import dayjs from 'dayjs'
import { Submission } from './types'
export * from './types'
export * from './constants'
export * from './sample'
export * from './preset'

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
