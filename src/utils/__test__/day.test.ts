import MockDate from 'mockdate'
import {
  timeStamp,
  isMoreThanOneDay,
  isChristmasDuration,
  isNewYearDuration,
} from '../day'
import dayjs from 'dayjs'

describe('timeStamp', () => {
  beforeEach(async () => {
    MockDate.reset()
  })

  it.each<[unixTime: number, expected: string]>([
    [1666008000, '2022/10/17 21:00'],
    [1560000000, '2019/06/08 22:20'],
    [2560000000, '2051/02/15 00:06'],
  ])('if unixTime is %s then timeStamp returns %s', (unixTime, expected) => {
    MockDate.set(unixTime * 1000)
    expect(timeStamp()).toEqual(expected)
  })
})

describe('isMoreThanOneDay', () => {
  beforeEach(async () => {
    MockDate.reset()
  })

  it.each<[today: string, input: string, expected: boolean]>([
    ['2023-12-01', '2023-11-01', true],
    ['2023-12-01', '2023-12-01', false],
    ['2023-12-01', '2023-12-02', false],
    ['2023-12-01 00:00:00', '2023-11-01 09:00:00', true],
    ['2023-12-01 00:00:00', '2023-12-01 09:00:00', false],
    ['2023-12-01 00:00:00', '2023-12-02 09:00:00', false],
    ['2023-12-01 09:00:00', '2023-11-01 01:00:00', true],
    ['2023-12-01 09:00:00', '2023-12-01 01:00:00', false],
    ['2023-12-01 09:00:00', '2023-12-02 01:00:00', false],
    // ['2023-12-23', false],
    // [`${year}-12-24`, true],
    // [`${year}-12-25`, true],
    // ['2023-12-26', false],
    // [`${year + 10}-12-24`, true],
    // [`${year + 20}-12-25`, true],
    // [`${year + 30}-12-26`, false],
  ])(
    'if day is %s then isMoreThanOneDay returns %s',
    (today, input, expected) => {
      MockDate.set(dayjs(today).locale('ja').toString())
      const milliUnixTime = dayjs(input).locale('ja').valueOf()
      expect(isMoreThanOneDay(milliUnixTime)).toEqual(expected)
    },
  )
})

describe('isChristmasDuration', () => {
  const year = dayjs().locale('ja').year()

  beforeEach(async () => {
    MockDate.reset()
  })

  it.each<[today: string, expected: boolean]>([
    ['2023-12-01', false],
    ['2023-12-23', false],
    [`${year}-12-24`, true],
    [`${year}-12-25`, true],
    ['2023-12-26', false],
    [`${year + 10}-12-24`, true],
    [`${year + 20}-12-25`, true],
    [`${year + 30}-12-26`, false],
  ])('if day is %s then isChristmasDuration returns %s', (today, expected) => {
    MockDate.set(dayjs(today).locale('ja').toString())
    expect(isChristmasDuration()).toEqual(expected)
  })
})

describe('isNewYearDuration', () => {
  const year = dayjs().locale('ja').year()

  beforeEach(async () => {
    MockDate.reset()
  })

  it.each<[today: string, expected: boolean]>([
    ['2023-12-01', false],
    ['2023-12-23', false],
    [`${year}-01-01`, true],
    [`${year}-01-02`, true],
    [`${year}-01-03`, true],
    [`${year}-01-04`, false],
    ['2023-12-26', false],
    [`${year + 10}-01-01`, true],
    [`${year + 20}-01-02`, true],
    [`${year + 30}-01-04`, false],
  ])('if day is %s then isNewYearDuration returns %s', (today, expected) => {
    MockDate.set(dayjs(today).locale('ja').toString())
    expect(isNewYearDuration()).toEqual(expected)
  })
})
