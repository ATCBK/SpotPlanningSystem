import { describe, expect, it } from 'vitest'
import { shortestPath } from '../../src/utils/dijkstra'
import { cityEdges, type CityEdge } from '../../src/data/graph'

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

  it('supports optimizeBy=cost and composite route strategy', () => {
    const mockEdges: CityEdge[] = [
      { from: 'A', to: 'B', distance: 10, time: 10, cost: 10 },
      { from: 'A', to: 'C', distance: 12, time: 1, cost: 1 },
      { from: 'C', to: 'B', distance: 1, time: 1, cost: 1 },
    ]

    const byDistance = shortestPath(mockEdges, 'A', 'B', { optimizeBy: 'distance' })
    const byCost = shortestPath(mockEdges, 'A', 'B', { optimizeBy: 'cost' })
    const byComposite = shortestPath(mockEdges, 'A', 'B', { optimizeBy: 'composite' })

    expect(byDistance.path).toEqual(['A', 'B'])
    expect(byCost.path).toEqual(['A', 'C', 'B'])
    expect(byCost.totalCost).toBe(2)
    expect(byComposite.path).toEqual(['A', 'C', 'B'])
  })
})
