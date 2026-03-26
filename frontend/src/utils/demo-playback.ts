import type { DemoNode } from './demo-visual'

export type RenderedNodePhase = 'ambient' | 'queued' | 'candidate' | 'current' | 'visited' | 'rejected'

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function resolveDemoNodeRenderState(
  node: DemoNode,
  phase: RenderedNodePhase,
  progress: number,
  showFinalOnly: boolean,
) {
  const phaseOpacityMap: Record<RenderedNodePhase, number> = {
    ambient: 0.24,
    queued: 0.68,
    candidate: 0.88,
    current: 1,
    visited: 0.84,
    rejected: 0.48,
  }
  const labelBase = phase === 'ambient' ? 0.25 : phase === 'queued' ? 0.55 : 0.95

  return {
    ...node,
    phase,
    x: node.x,
    y: node.y,
    opacity: Number((phaseOpacityMap[phase] * (0.55 + progress * 0.45)).toFixed(2)),
    scale: 1,
    labelOpacity: Number((showFinalOnly.valueOf() ? 1 : clamp(labelBase * (0.4 + progress * 0.7))).toFixed(2)),
  }
}

export function shouldRenderComparisonEdge(isSelectedEdge: boolean) {
  return isSelectedEdge
}
