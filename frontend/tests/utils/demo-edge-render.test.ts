import { describe, expect, it } from 'vitest'
import {
  renderFinalBaseEdge,
  renderFinalEdge,
  renderFinalPulseEdge,
  renderProbeEdge,
  renderRejectedEdge,
} from '../../src/utils/demo-edge-render'
import type { DemoEdge, DemoEvent, DemoNode } from '../../src/utils/demo-visual'

const fromNode: DemoNode = {
  id: 'start',
  label: 'Start',
  x: 10,
  y: 20,
  scatterX: 8,
  scatterY: 24,
  iconName: 'start',
  active: true,
  role: 'start',
}

const toNode: DemoNode = {
  id: 'end',
  label: 'End',
  x: 70,
  y: 60,
  scatterX: 68,
  scatterY: 58,
  iconName: 'end',
  active: true,
  role: 'end',
}

const nodeMap = new Map([
  [fromNode.id, fromNode],
  [toNode.id, toNode],
])

const edge: DemoEdge = {
  id: 'edge-a',
  from: fromNode.id,
  to: toNode.id,
  start: 2,
  end: 4,
  label: '12 min',
}

const chooseEvent: DemoEvent = {
  id: 'choose-edge-a',
  type: 'choose-edge',
  start: 2,
  end: 4,
  segmentIndex: 0,
  stepIndex: 0,
  nodeId: toNode.id,
  edgeId: edge.id,
}

describe('demo edge rendering', () => {
  it('renders a persistent final base link before the active connection completes', () => {
    const rendered = renderFinalBaseEdge(edge, nodeMap, {
      playhead: 1,
      showFinalOnly: false,
      visualScale: 1,
      activeChooseEdgeId: null,
    })

    expect(rendered).not.toBeNull()
    expect(rendered?.layer).toBe('final-base')
    expect(rendered?.x1).toBe(fromNode.x)
    expect(rendered?.x2).toBe(toNode.x)
    expect(rendered?.strokeWidth).toBeGreaterThan(0.4)
    expect(rendered?.opacity).toBeGreaterThan(0.15)
  })

  it('grows the active final link from source to destination with a stronger stroke', () => {
    const rendered = renderFinalEdge(edge, nodeMap, {
      playhead: 3,
      showFinalOnly: false,
      visualScale: 1,
      activeChooseEdgeId: edge.id,
      chooseEvent,
    })

    expect(rendered).not.toBeNull()
    expect(rendered?.layer).toBe('final')
    expect(rendered?.x1).toBe(fromNode.x)
    expect(rendered?.x2).toBeGreaterThan(fromNode.x)
    expect(rendered?.x2).toBeLessThan(toNode.x)
    expect(rendered?.strokeWidth).toBeGreaterThan(0.7)
    expect(rendered?.markerEnd).toBe(true)
  })

  it('adds a moving pulse layer on the active final link to reinforce directionality', () => {
    const rendered = renderFinalPulseEdge(edge, nodeMap, {
      playhead: 3,
      showFinalOnly: false,
      visualScale: 1,
      activeChooseEdgeId: edge.id,
      chooseEvent,
    })

    expect(rendered).not.toBeNull()
    expect(rendered?.layer).toBe('final-pulse')
    expect(rendered?.dashArray).toBeTruthy()
    expect(rendered?.dashOffset).toBeGreaterThanOrEqual(0)
    expect(rendered?.opacity).toBeGreaterThan(0.8)
  })

  it('keeps probe edges visible as thicker dashed scouting links', () => {
    const probeEvent: DemoEvent = {
      id: 'probe-edge-a',
      type: 'probe-edge',
      start: 1,
      end: 2,
      segmentIndex: 0,
      stepIndex: 0,
      nodeId: toNode.id,
      edgeId: edge.id,
    }

    const rendered = renderProbeEdge(edge, nodeMap, {
      playhead: 2.5,
      showFinalOnly: false,
      visualScale: 1,
      activeProbeEdgeId: edge.id,
      probeEvent,
    })

    expect(rendered).not.toBeNull()
    expect(rendered?.strokeWidth).toBeGreaterThan(0.3)
    expect(rendered?.dashArray).toBeTruthy()
  })

  it('fades rejected scouting links instead of leaving them as solid artifacts', () => {
    const rejectEvent: DemoEvent = {
      id: 'reject-edge-a',
      type: 'reject-edge',
      start: 2,
      end: 3,
      segmentIndex: 0,
      stepIndex: 0,
      nodeId: toNode.id,
      edgeId: edge.id,
    }

    const rendered = renderRejectedEdge(edge, nodeMap, {
      playhead: 2.25,
      showFinalOnly: false,
      visualScale: 1,
      activeRejectEdgeId: edge.id,
      rejectEvent,
    })

    expect(rendered).not.toBeNull()
    expect(rendered?.opacity).toBeLessThan(0.78)
    expect(rendered?.dashArray).toBeTruthy()
  })
})
