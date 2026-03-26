import { describe, expect, it } from 'vitest'
import { buildTripSummaryItems } from '../../src/utils/trip-result'

describe('buildTripSummaryItems', () => {
  it('returns four compact summary cards for the result overview panel', () => {
    const items = buildTripSummaryItems({
      optimizeByLabel: '最短路径',
      totalDistance: 319,
      totalTime: 6,
      totalCost: 485,
      spotCount: 6,
    })

    expect(items).toHaveLength(4)
    expect(items.map((item) => item.label)).toEqual(['优化策略', '覆盖景点', '总里程', '预计费用'])
    expect(items[1]?.value).toBe('6 个')
  })
})
