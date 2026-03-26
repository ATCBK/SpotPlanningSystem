import type { CityEdge } from '../data/graph'

export type OptimizeBy = 'distance' | 'cost' | 'composite'

export type RouteLeg = {
  from: string
  to: string
  distance: number
  time: number
  cost: number
}

export type PathResult = {
  path: string[]
  legs: RouteLeg[]
  totalDistance: number
  totalTime: number
  totalCost: number
  totalWeight: number
}

export type WeightedRouteEdge = {
  from: string
  to: string
  weight: number
  label: string
}

export type DijkstraRelaxation = WeightedRouteEdge & {
  accepted: boolean
  candidateTotal: number
}

export type DijkstraTraceStep = {
  current: string
  currentDistance: number
  relaxations: DijkstraRelaxation[]
}

export type PathTraceResult = PathResult & {
  traceSteps: DijkstraTraceStep[]
  finalPathEdges: WeightedRouteEdge[]
}

type Graph = Map<string, RouteLeg[]>

type CompositeWeights = {
  distance: number
  time: number
  cost: number
}

type ShortestPathOptions = {
  optimizeBy?: OptimizeBy
  compositeWeights?: CompositeWeights
}

const defaultCompositeWeights: CompositeWeights = {
  distance: 0.4,
  time: 0.3,
  cost: 0.3,
}

function buildGraph(edges: CityEdge[]): Graph {
  const graph = new Map<string, RouteLeg[]>()
  for (const edge of edges) {
    const forward: RouteLeg = {
      from: edge.from,
      to: edge.to,
      distance: edge.distance,
      time: edge.time,
      cost: edge.cost,
    }
    const backward: RouteLeg = {
      from: edge.to,
      to: edge.from,
      distance: edge.distance,
      time: edge.time,
      cost: edge.cost,
    }
    graph.set(edge.from, [...(graph.get(edge.from) ?? []), forward])
    graph.set(edge.to, [...(graph.get(edge.to) ?? []), backward])
  }
  return graph
}

function normalize(value: number, min: number, max: number) {
  if (max <= min) {
    return 0
  }
  return (value - min) / (max - min)
}

function buildEdgeWeightGetter(edges: CityEdge[], options?: ShortestPathOptions) {
  const optimizeBy = options?.optimizeBy ?? 'distance'
  if (optimizeBy === 'distance') {
    return (leg: RouteLeg) => leg.distance
  }
  if (optimizeBy === 'cost') {
    return (leg: RouteLeg) => leg.cost
  }

  const weights = options?.compositeWeights ?? defaultCompositeWeights
  const distanceValues = edges.map((edge) => edge.distance)
  const timeValues = edges.map((edge) => edge.time)
  const costValues = edges.map((edge) => edge.cost)

  const minDistance = Math.min(...distanceValues)
  const maxDistance = Math.max(...distanceValues)
  const minTime = Math.min(...timeValues)
  const maxTime = Math.max(...timeValues)
  const minCost = Math.min(...costValues)
  const maxCost = Math.max(...costValues)

  return (leg: RouteLeg) => {
    const normalizedDistance = normalize(leg.distance, minDistance, maxDistance)
    const normalizedTime = normalize(leg.time, minTime, maxTime)
    const normalizedCost = normalize(leg.cost, minCost, maxCost)
    return (
      normalizedDistance * weights.distance +
      normalizedTime * weights.time +
      normalizedCost * weights.cost
    )
  }
}

export function formatLegWeightLabel(leg: RouteLeg, edges: CityEdge[], options?: ShortestPathOptions) {
  const optimizeBy = options?.optimizeBy ?? 'distance'
  if (optimizeBy === 'distance') {
    return `${leg.distance} km`
  }
  if (optimizeBy === 'cost') {
    return `¥${leg.cost}`
  }
  const weight = buildEdgeWeightGetter(edges, options)(leg)
  return `W ${weight.toFixed(2)}`
}

function buildWeightedEdge(leg: RouteLeg, edges: CityEdge[], options?: ShortestPathOptions): WeightedRouteEdge {
  const weight = buildEdgeWeightGetter(edges, options)(leg)
  return {
    from: leg.from,
    to: leg.to,
    weight: Number(weight.toFixed(2)),
    label: formatLegWeightLabel(leg, edges, options),
  }
}

function computeShortestPath(
  edges: CityEdge[],
  start: string,
  end: string,
  options?: ShortestPathOptions,
  withTrace = false,
): PathResult | PathTraceResult {
  if (start === end) {
    const base: PathResult = { path: [start], legs: [], totalDistance: 0, totalTime: 0, totalCost: 0, totalWeight: 0 }
    return withTrace ? { ...base, traceSteps: [], finalPathEdges: [] } : base
  }

  const graph = buildGraph(edges)
  const edgeWeight = buildEdgeWeightGetter(edges, options)
  const nodes = Array.from(graph.keys())
  const distances = new Map<string, number>(nodes.map((node) => [node, Number.POSITIVE_INFINITY]))
  const previousNode = new Map<string, string>()
  const previousLeg = new Map<string, RouteLeg>()
  const unvisited = new Set(nodes)
  const traceSteps: DijkstraTraceStep[] = []

  distances.set(start, 0)

  while (unvisited.size > 0) {
    let current: string | null = null
    let min = Number.POSITIVE_INFINITY

    for (const node of unvisited) {
      const value = distances.get(node) ?? Number.POSITIVE_INFINITY
      if (value < min) {
        min = value
        current = node
      }
    }

    if (!current || min === Number.POSITIVE_INFINITY) {
      break
    }

    unvisited.delete(current)
    if (current === end) {
      break
    }

    const relaxations: DijkstraRelaxation[] = []
    for (const leg of graph.get(current) ?? []) {
      if (!unvisited.has(leg.to)) {
        continue
      }
      const candidate = (distances.get(current) ?? Number.POSITIVE_INFINITY) + edgeWeight(leg)
      const accepted = candidate < (distances.get(leg.to) ?? Number.POSITIVE_INFINITY)

      relaxations.push({
        ...buildWeightedEdge(leg, edges, options),
        accepted,
        candidateTotal: Number(candidate.toFixed(2)),
      })

      if (accepted) {
        distances.set(leg.to, candidate)
        previousNode.set(leg.to, current)
        previousLeg.set(leg.to, leg)
      }
    }

    if (withTrace && relaxations.length > 0) {
      traceSteps.push({
        current,
        currentDistance: Number(min.toFixed(2)),
        relaxations,
      })
    }
  }

  if (!previousNode.has(end)) {
    throw new Error(`No route found between ${start} and ${end}`)
  }

  const path: string[] = [end]
  const legs: RouteLeg[] = []
  let cursor = end
  while (cursor !== start) {
    const leg = previousLeg.get(cursor)
    const prev = previousNode.get(cursor)
    if (!leg || !prev) {
      throw new Error(`Broken route chain between ${start} and ${end}`)
    }
    legs.unshift(leg)
    path.unshift(prev)
    cursor = prev
  }

  const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0)
  const totalTime = Number(legs.reduce((sum, leg) => sum + leg.time, 0).toFixed(1))
  const totalCost = legs.reduce((sum, leg) => sum + leg.cost, 0)
  const totalWeight = distances.get(end) ?? 0
  const result: PathResult = {
    path,
    legs,
    totalDistance,
    totalTime,
    totalCost,
    totalWeight,
  }

  if (!withTrace) {
    return result
  }

  return {
    ...result,
    traceSteps,
    finalPathEdges: legs.map((leg) => buildWeightedEdge(leg, edges, options)),
  }
}

export function shortestPath(
  edges: CityEdge[],
  start: string,
  end: string,
  options?: ShortestPathOptions,
): PathResult {
  return computeShortestPath(edges, start, end, options, false) as PathResult
}

export function shortestPathWithTrace(
  edges: CityEdge[],
  start: string,
  end: string,
  options?: ShortestPathOptions,
): PathTraceResult {
  return computeShortestPath(edges, start, end, options, true) as PathTraceResult
}
