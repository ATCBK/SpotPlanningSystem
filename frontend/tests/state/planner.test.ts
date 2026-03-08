import { describe, expect, it } from 'vitest'
import { buildRoutePlan } from '../../src/state/planner'

describe('buildRoutePlan', () => {
  it('builds a route using start/pass/end spots', () => {
    const plan = buildRoutePlan('河南博物院', '清明上河园', ['龙门石窟'])

    expect(plan.routeSpotNames[0]).toBe('河南博物院')
    expect(plan.routeSpotNames[plan.routeSpotNames.length - 1]).toBe('清明上河园')
    expect(plan.totalDistance).toBeGreaterThan(0)
    expect(plan.legs.length).toBeGreaterThan(0)
  })
})
