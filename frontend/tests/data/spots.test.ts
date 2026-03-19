import { describe, expect, it } from 'vitest'
import { filterSpots, spots } from '../../src/data/spots'

describe('spots dataset', () => {
  it('expands the scenic spot overview to sixteen attractions within the existing six cities', () => {
    expect(spots).toHaveLength(16)
    expect(spots.map((spot) => spot.name)).toEqual(
      expect.arrayContaining(['二七纪念塔', '洛阳博物馆', '铁塔公园', '卧龙岗武侯祠']),
    )
    expect(new Set(spots.map((spot) => spot.city))).toEqual(
      new Set(['郑州', '洛阳', '开封', '安阳', '焦作', '南阳']),
    )
  })

  it('returns all scenic spots for a city when topic filter is set to 全部', () => {
    const zhengzhouSpots = filterSpots(spots, '郑州', '全部')

    expect(zhengzhouSpots.map((spot) => spot.name)).toEqual(
      expect.arrayContaining(['河南博物院', '少林寺', '嵩阳书院', '二七纪念塔']),
    )
    expect(zhengzhouSpots).toHaveLength(4)
  })
})
