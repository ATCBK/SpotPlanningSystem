import { describe, expect, it } from 'vitest'
import { buildAnimatedLegs } from '../../src/utils/route-visual'

const legs = [
  { from: '南阳', to: '郑州', distance: 128, time: 2.0, cost: 130 },
  { from: '郑州', to: '安阳', distance: 184, time: 2.8, cost: 190 },
]

describe('buildAnimatedLegs', () => {
  it('creates one animated segment per leg with cumulative delay', () => {
    const animated = buildAnimatedLegs(legs)

    expect(animated).toHaveLength(2)
    expect(animated[0]?.delay).toBe(0)
    expect(animated[1]?.delay).toBeGreaterThanOrEqual(animated[0]?.duration ?? 0)
  })
})
