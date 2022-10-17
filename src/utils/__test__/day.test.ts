import MockDate from 'mockdate'
import { timeStamp } from '../day'

describe('timeStamp', () => {
  beforeEach(async () => {
    MockDate.reset()
  })

  it.each<[unixTime: number, expected: string]>([
    [
      1666008000,
      "2022/10/17 21:00",
    ],
    [
      1560000000,
      "2019/06/08 22:20",
    ],
    [
      2560000000,
      "2051/02/15 00:06",
    ],
  ])('if unixTime is %s then timeStamp returns %s', (unixTime, expected) => {
    MockDate.set(unixTime* 1000)
    expect(timeStamp()).toEqual(expected)
  })
})
