import { describe, expect, it } from 'vitest'
import { spots } from '../../src/data/spots'
import { buildRoutePlan, plannerState, syncCurrentPlanFromSelection } from '../../src/state/planner'
import { buildRecommendLayout } from '../../src/utils/recommend-layout'

const startSpot = spots[0]?.name ?? ''
const endSpot = spots[6]?.name ?? spots[1]?.name ?? ''
const passSpot = spots[3]?.name ?? ''
const whiteHorseTemple = spots[4]?.name ?? ''
const ironPagodaPark = spots[14]?.name ?? ''
const yinxu = spots[8]?.name ?? ''
const yuntaiMountain = spots[10]?.name ?? ''
const yishengTemple = spots[11]?.name ?? ''

describe('buildRoutePlan', () => {
  it('builds a route using start/pass/end spots', () => {
    const plan = buildRoutePlan(startSpot, endSpot, [passSpot])

    expect(plan.routeSpotNames[0]).toBe(startSpot)
    expect(plan.routeSpotNames[plan.routeSpotNames.length - 1]).toBe(endSpot)
    expect(plan.totalDistance).toBeGreaterThan(0)
    expect(plan.legs.length).toBeGreaterThan(0)
  })

  it('stores optimize strategy on route plan', () => {
    const plan = buildRoutePlan(startSpot, endSpot, [passSpot], 'cost')
    expect(plan.optimizeBy).toBe('cost')
  })

  it('supports newly added scenic spots from 信阳 in route planning', () => {
    const plan = buildRoutePlan('西河古村', '清明上河园', [], 'distance')

    expect(plan.routeSpotNames).toEqual(['西河古村', '清明上河园'])
    expect(plan.routeCityPath[0]).toBe('信阳')
    expect(plan.routeCityPath[plan.routeCityPath.length - 1]).toBe('开封')
    expect(plan.totalDistance).toBeGreaterThan(0)
    expect(plan.legs.length).toBeGreaterThan(0)
  })

  it('reorders pass spots so the city route stays feasible without revisiting a city', () => {
    const plan = buildRoutePlan(whiteHorseTemple, '清明上河园', [ironPagodaPark, yinxu], 'distance')

    expect(plan.routeSpotNames).toEqual([whiteHorseTemple, yinxu, ironPagodaPark, '清明上河园'])
    expect(plan.routeCityPath).toEqual(['洛阳', '郑州', '安阳', '开封'])
  })

  it('expands the displayed city path to the actual no-repeat transit sequence', () => {
    const plan = buildRoutePlan(yuntaiMountain, '清明上河园', [yishengTemple], 'distance')

    expect(plan.routeSpotNames).toEqual([yuntaiMountain, yishengTemple, '清明上河园'])
    expect(plan.routeCityPath).toEqual(['焦作', '洛阳', '南阳', '郑州', '开封'])
    expect(plan.legs.map((leg) => `${leg.from}->${leg.to}`)).toEqual(['焦作->洛阳', '洛阳->南阳', '南阳->郑州', '郑州->开封'])
  })

  it('builds a shortest city route that never visits the same city twice', () => {
    const plan = buildRoutePlan(yuntaiMountain, '清明上河园', [yishengTemple], 'distance')

    expect(plan.routeSpotNames).toEqual([yuntaiMountain, yishengTemple, '清明上河园'])
    expect(plan.routeCityPath).toEqual(['焦作', '洛阳', '南阳', '郑州', '开封'])
    expect(new Set(plan.routeCityPath).size).toBe(plan.routeCityPath.length)
    expect(plan.legs.map((leg) => `${leg.from}->${leg.to}`)).toEqual([
      '焦作->洛阳',
      '洛阳->南阳',
      '南阳->郑州',
      '郑州->开封',
    ])
  })

  it('falls back to a compressed no-repeat city route when a fully simple city walk is impossible', () => {
    const plan = buildRoutePlan('殷墟', '清明上河园', ['嵩阳书院', '包公祠', '老君山', '云台山', '医圣祠'], 'distance')

    expect(plan.routeSpotNames).toEqual(['殷墟', '嵩阳书院', '云台山', '老君山', '医圣祠', '包公祠', '清明上河园'])
    expect(plan.routeCityPath).toEqual(['安阳', '郑州', '焦作', '洛阳', '南阳', '开封'])
    expect(new Set(plan.routeCityPath).size).toBe(plan.routeCityPath.length)
    expect(plan.legs.map((leg) => `${leg.from}->${leg.to}`)).toEqual([
      '安阳->郑州',
      '郑州->焦作',
      '焦作->洛阳',
      '洛阳->南阳',
      '南阳->开封',
    ])
  })
})

describe('syncCurrentPlanFromSelection', () => {
  it('updates shared current plan with selected strategy for cross-page sync', () => {
    const plan = syncCurrentPlanFromSelection(startSpot, endSpot, [passSpot], 'composite')

    expect(plan.routeSpotNames).toEqual([startSpot, passSpot, endSpot])
    expect(plan.optimizeBy).toBe('composite')
    expect(plannerState.currentPlan?.routeSpotNames).toEqual([startSpot, passSpot, endSpot])
    expect(plannerState.currentPlan?.optimizeBy).toBe('composite')
  })
})

describe('buildRecommendLayout', () => {
  it('keeps all nodes visible when the route contains more than five scenic spots', () => {
    const nodes = spots.slice(0, 7).map((spot) => spot.name)
    const layout = buildRecommendLayout(nodes)

    expect(layout.nodes).toHaveLength(7)
    expect(layout.segments).toHaveLength(6)
    expect(new Set(layout.nodes.map((node) => `${node.x}-${node.y}`)).size).toBe(7)
  })
})
