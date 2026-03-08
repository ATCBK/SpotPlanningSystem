import { describe, expect, it } from 'vitest'
import { shortestPath } from '../../src/utils/dijkstra'
import { cityEdges } from '../../src/data/graph'

describe('shortestPath', () => {
  it('returns shortest route and totals from 郑州 to 开封', () => {
    const result = shortestPath(cityEdges, '郑州', '开封')

    expect(result.path).toEqual(['郑州', '开封'])
    expect(result.totalDistance).toBe(78)
    expect(result.totalTime).toBeCloseTo(1.3)
    expect(result.totalCost).toBe(95)
  })

  it('returns multi-hop route from 南阳 to 安阳', () => {
    const result = shortestPath(cityEdges, '南阳', '安阳')

    expect(result.path).toEqual(['南阳', '郑州', '安阳'])
    expect(result.totalDistance).toBe(312)
  })
})
