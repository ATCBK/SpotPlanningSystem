import type { DemoEdge, DemoEvent, DemoNode } from './demo-visual'

export type DemoEdgeLayer = 'probe' | 'rejected' | 'final-base' | 'final' | 'final-pulse'

export type RenderedEdge = {
  id: string
  label: string
  x1: number
  y1: number
  x2: number
  y2: number
  labelX: number
  labelY: number
  opacity: number
  labelOpacity: number
  strokeWidth: number
  dashArray?: string
  dashOffset?: number
  markerEnd?: boolean
  layer: DemoEdgeLayer
}

export type EdgeRenderContext = {
  playhead: number
  showFinalOnly: boolean
  visualScale: number
  activeProbeEdgeId?: string | null
  activeRejectEdgeId?: string | null
  activeChooseEdgeId?: string | null
  probeEvent?: DemoEvent | null
  rejectEvent?: DemoEvent | null
  chooseEvent?: DemoEvent | null
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function mix(a: number, b: number, ratio: number) {
  return Number((a + (b - a) * ratio).toFixed(2))
}

function hashString(value: string) {
  return Array.from(value).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0)
}

export function getOffsetLabelPosition(
  from: { x: number; y: number },
  to: { x: number; y: number },
  ratio: number,
  distance: number,
  key: string,
) {
  const baseX = mix(from.x, to.x, ratio)
  const baseY = mix(from.y, to.y, ratio)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const sign = hashString(key) % 2 === 0 ? 1 : -1
  const offsetX = (-dy / length) * distance * sign
  const offsetY = (dx / length) * distance * sign

  return {
    x: Number((baseX + offsetX).toFixed(2)),
    y: Number((baseY + offsetY).toFixed(2)),
  }
}

function getLineLength(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.hypot(to.x - from.x, to.y - from.y)
}

function getNodes(nodeMap: Map<string, DemoNode>, edge: DemoEdge) {
  const from = nodeMap.get(edge.from)
  const to = nodeMap.get(edge.to)
  if (!from || !to) {
    return null
  }
  return { from, to }
}

export function renderProbeEdge(
  edge: DemoEdge,
  nodeMap: Map<string, DemoNode>,
  context: EdgeRenderContext,
) {
  const nodes = getNodes(nodeMap, edge)
  if (!nodes || !context.probeEvent) {
    return null
  }
  if (!context.showFinalOnly && context.playhead < context.probeEvent.start) {
    return null
  }
  if (context.rejectEvent && context.playhead >= context.rejectEvent.start && !context.showFinalOnly) {
    return null
  }

  const { from, to } = nodes
  const progress = context.showFinalOnly
    ? 1
    : clamp((context.playhead - edge.start) / Math.max(edge.end - edge.start, 0.01))
  if (progress <= 0) {
    return null
  }

  const settled = context.showFinalOnly || context.playhead >= edge.end
  const x2 = settled ? to.x : mix(from.x, to.x, progress)
  const y2 = settled ? to.y : mix(from.y, to.y, progress)
  const opacity = context.showFinalOnly
    ? 0
    : settled && context.chooseEvent && context.playhead >= context.chooseEvent.start
      ? 0
      : 0.32 + progress * 0.42
  const labelPoint = getOffsetLabelPosition(from, to, settled ? 0.5 : Math.min(progress, 0.68), 4.4 * context.visualScale, edge.id)

  return {
    id: edge.id,
    label: edge.label,
    x1: from.x,
    y1: from.y,
    x2,
    y2,
    labelX: labelPoint.x,
    labelY: labelPoint.y,
    opacity: Number(clamp(opacity).toFixed(2)),
    labelOpacity: Number(clamp(opacity * 0.95).toFixed(2)),
    strokeWidth: Number((0.36 * context.visualScale).toFixed(2)),
    dashArray: `${Number((1.6 * context.visualScale).toFixed(2))} ${Number((1.15 * context.visualScale).toFixed(2))}`,
    layer: 'probe',
  } satisfies RenderedEdge
}

export function renderRejectedEdge(
  edge: DemoEdge,
  nodeMap: Map<string, DemoNode>,
  context: EdgeRenderContext,
) {
  const nodes = getNodes(nodeMap, edge)
  if (!nodes || !context.rejectEvent) {
    return null
  }
  if (!context.showFinalOnly && context.playhead < context.rejectEvent.start) {
    return null
  }

  const { from, to } = nodes
  const progress = context.showFinalOnly
    ? 1
    : clamp((context.playhead - context.rejectEvent.start) / Math.max(context.rejectEvent.end - context.rejectEvent.start, 0.01))
  const opacity = context.showFinalOnly ? 0 : Number((0.78 * (1 - progress)).toFixed(2))
  if (opacity <= 0) {
    return null
  }
  const labelPoint = getOffsetLabelPosition(from, to, 0.5, 3.6 * context.visualScale, edge.id)

  return {
    id: edge.id,
    label: edge.label,
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    labelX: labelPoint.x,
    labelY: labelPoint.y,
    opacity,
    labelOpacity: Number((opacity * 0.9).toFixed(2)),
    strokeWidth: Number((0.28 * context.visualScale).toFixed(2)),
    dashArray: `${Number((1.1 * context.visualScale).toFixed(2))} ${Number((1.5 * context.visualScale).toFixed(2))}`,
    layer: 'rejected',
  } satisfies RenderedEdge
}

export function renderFinalBaseEdge(
  edge: DemoEdge,
  nodeMap: Map<string, DemoNode>,
  context: EdgeRenderContext,
) {
  const nodes = getNodes(nodeMap, edge)
  if (!nodes) {
    return null
  }

  const { from, to } = nodes
  const isActive = context.activeChooseEdgeId === edge.id
  const opacity = context.showFinalOnly ? 0.44 : isActive ? 0.34 : 0.2
  const labelPoint = getOffsetLabelPosition(from, to, 0.5, 5.2 * context.visualScale, `${edge.id}-base`)

  return {
    id: edge.id,
    label: edge.label,
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    labelX: labelPoint.x,
    labelY: labelPoint.y,
    opacity: Number(opacity.toFixed(2)),
    labelOpacity: Number((context.showFinalOnly ? 0.34 : 0).toFixed(2)),
    strokeWidth: Number((0.42 * context.visualScale).toFixed(2)),
    layer: 'final-base',
  } satisfies RenderedEdge
}

export function renderFinalEdge(
  edge: DemoEdge,
  nodeMap: Map<string, DemoNode>,
  context: EdgeRenderContext,
) {
  const nodes = getNodes(nodeMap, edge)
  if (!nodes) {
    return null
  }

  const { from, to } = nodes
  const progress = context.showFinalOnly
    ? 1
    : clamp((context.playhead - edge.start) / Math.max(edge.end - edge.start, 0.01))
  if (progress <= 0) {
    return null
  }

  const isActive = context.activeChooseEdgeId === edge.id
  const lineProgress = context.showFinalOnly ? 1 : isActive ? progress : 1
  const opacity = context.showFinalOnly ? 0.96 : isActive ? 0.72 + progress * 0.26 : 0.68
  const labelOpacity = context.showFinalOnly ? 0.74 : isActive ? 0.96 : 0.3
  const strokeWidth = isActive ? 0.74 * context.visualScale : 0.58 * context.visualScale
  const labelPoint = getOffsetLabelPosition(from, to, context.showFinalOnly ? 0.5 : Math.min(progress, 0.74), 4.9 * context.visualScale, edge.id)

  return {
    id: edge.id,
    label: edge.label,
    x1: from.x,
    y1: from.y,
    x2: mix(from.x, to.x, lineProgress),
    y2: mix(from.y, to.y, lineProgress),
    labelX: labelPoint.x,
    labelY: labelPoint.y,
    opacity: Number(opacity.toFixed(2)),
    labelOpacity: Number(labelOpacity.toFixed(2)),
    strokeWidth: Number(strokeWidth.toFixed(2)),
    markerEnd: true,
    layer: 'final',
  } satisfies RenderedEdge
}

export function renderFinalPulseEdge(
  edge: DemoEdge,
  nodeMap: Map<string, DemoNode>,
  context: EdgeRenderContext,
) {
  const nodes = getNodes(nodeMap, edge)
  if (!nodes) {
    return null
  }

  const { from, to } = nodes
  const isActive = context.activeChooseEdgeId === edge.id
  const progress = context.showFinalOnly
    ? 1
    : clamp((context.playhead - edge.start) / Math.max(edge.end - edge.start, 0.01))
  if (!context.showFinalOnly && (!isActive || progress <= 0)) {
    return null
  }

  const lineProgress = context.showFinalOnly ? 1 : progress
  const length = getLineLength(from, to) * lineProgress
  const pulseLength = Math.max(5.2, length * 0.26)
  const gapLength = Math.max(2.4, length * 0.74)
  const dashOffset = context.showFinalOnly ? 0 : Number(((1 - progress) * (length + pulseLength * 0.4)).toFixed(2))

  return {
    id: edge.id,
    label: edge.label,
    x1: from.x,
    y1: from.y,
    x2: mix(from.x, to.x, lineProgress),
    y2: mix(from.y, to.y, lineProgress),
    labelX: mix(from.x, to.x, 0.5),
    labelY: mix(from.y, to.y, 0.5),
    opacity: Number((context.showFinalOnly ? 0.48 : 0.9).toFixed(2)),
    labelOpacity: 0,
    strokeWidth: Number(((context.showFinalOnly ? 0.3 : 0.42) * context.visualScale).toFixed(2)),
    dashArray: `${Number(pulseLength.toFixed(2))} ${Number(gapLength.toFixed(2))}`,
    dashOffset,
    markerEnd: !context.showFinalOnly,
    layer: 'final-pulse',
  } satisfies RenderedEdge
}
