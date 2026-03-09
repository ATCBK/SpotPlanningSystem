import { describe, expect, it } from 'vitest'
import { buildRoutePlan, plannerState, syncCurrentPlanFromSelection } from '../../src/state/planner'

describe('buildRoutePlan', () => {
  it('builds a route using start/pass/end spots', () => {
    const plan = buildRoutePlan('河南博物院', '清明上河园', ['龙门石窟'])

    expect(plan.routeSpotNames[0]).toBe('河南博物院')
    expect(plan.routeSpotNames[plan.routeSpotNames.length - 1]).toBe('清明上河园')
    expect(plan.totalDistance).toBeGreaterThan(0)
    expect(plan.legs.length).toBeGreaterThan(0)
  })

  it('reorders pass spots by shortest-path cost while keeping start and end fixed', () => {
    const plan = buildRoutePlan('河南博物院', '包公祠', ['白马寺', '少林寺'])

    expect(plan.routeSpotNames).toEqual(['河南博物院', '少林寺', '白马寺', '包公祠'])
  })
})

describe('syncCurrentPlanFromSelection', () => {
  it('updates shared current plan for cross-page sync', () => {
    const plan = syncCurrentPlanFromSelection('河南博物院', '清明上河园', ['龙门石窟'])

    expect(plan.routeSpotNames).toEqual(['河南博物院', '龙门石窟', '清明上河园'])
    expect(plannerState.currentPlan?.routeSpotNames).toEqual(['河南博物院', '龙门石窟', '清明上河园'])
  })
})
