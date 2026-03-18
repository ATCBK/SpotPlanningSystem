import { describe, expect, it } from 'vitest'
import { buildRoutePlan, plannerState, syncCurrentPlanFromSelection } from '../../src/state/planner'
import { spots } from '../../src/data/spots'

const startSpot = spots[0]?.name ?? ''
const endSpot = spots[6]?.name ?? spots[1]?.name ?? ''
const passSpot = spots[3]?.name ?? ''

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
