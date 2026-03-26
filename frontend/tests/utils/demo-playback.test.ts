import { describe, expect, it } from 'vitest'
import type { DemoNode } from '../../src/utils/demo-visual'
import { resolveDemoNodeRenderState, shouldRenderComparisonEdge } from '../../src/utils/demo-playback'

const baseNode: DemoNode = {
  id: 'node-1',
  label: 'Test Node',
  x: 42,
  y: 58,
  scatterX: 12,
  scatterY: 18,
  iconName: 'Test Node',
  active: true,
  role: 'pass',
}

describe('resolveDemoNodeRenderState', () => {
  it('keeps nodes fixed at their final positions during playback', () => {
    const early = resolveDemoNodeRenderState(baseNode, 'queued', 0.1, false)
    const middle = resolveDemoNodeRenderState(baseNode, 'candidate', 0.5, false)
    const late = resolveDemoNodeRenderState(baseNode, 'current', 1, false)

    expect(early.x).toBe(baseNode.x)
    expect(early.y).toBe(baseNode.y)
    expect(middle.x).toBe(baseNode.x)
    expect(middle.y).toBe(baseNode.y)
    expect(late.x).toBe(baseNode.x)
    expect(late.y).toBe(baseNode.y)
  })
})

describe('shouldRenderComparisonEdge', () => {
  it('hides non-selected comparison edges during the algorithm demo', () => {
    expect(shouldRenderComparisonEdge(false)).toBe(false)
  })
})
