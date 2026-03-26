import { describe, expect, it } from 'vitest'
import { spots } from '../../src/data/spots'
import { buildHomeOverviewContent } from '../../src/utils/home-overview'

describe('buildHomeOverviewContent', () => {
  it('builds poster metrics from the current Henan tourism dataset', () => {
    const content = buildHomeOverviewContent(spots)

    expect(content.poster.title).toBe('河南文旅数据')
    expect(content.poster.stats).toEqual([
      { label: '覆盖城市', value: '6' },
      { label: '精选景点', value: '16' },
      { label: '主题线路', value: '3' },
    ])
    expect(content.featuredCards).toHaveLength(3)
    expect(content.featuredCards.map((card) => card.name)).toEqual(['洛阳 · 龙门石窟', '登封 · 少林寺', '开封 · 清明上河园'])
    expect(content.featuredCards.map((card) => card.scoreText)).toEqual(['4.9★', '4.8★', '4.7★'])
    expect(content.featuredCards.every((card) => card.detailText.includes('建议停留'))).toBe(true)
    expect(content.featuredCards.every((card) => card.img.startsWith('/images/spots/'))).toBe(true)
  })
})
