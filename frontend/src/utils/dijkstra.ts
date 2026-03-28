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

export function getRouteLegWeight(
  leg: RouteLeg,
  edges: CityEdge[],
  options?: ShortestPathOptions,
) {
  return buildEdgeWeightGetter(edges, options)(leg)
}

const cityHeuristicPoints: Record<string, { x: number; y: number }> = {
  郑州: { x: 40, y: 48 },
  洛阳: { x: 26, y: 56 },
  开封: { x: 57, y: 47 },
  安阳: { x: 48, y: 33 },
  焦作: { x: 35, y: 38 },
  南阳: { x: 28, y: 74 },
  信阳: { x: 49, y: 86 },
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

function getPointDistance(from: string, to: string) {
  const fromPoint = cityHeuristicPoints[from]
  const toPoint = cityHeuristicPoints[to]
  if (!fromPoint || !toPoint) {
    return 0
  }
  return Math.hypot(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y)
}

function buildHeuristicGetter(edges: CityEdge[], options?: ShortestPathOptions) {
  const optimizeBy = options?.optimizeBy ?? 'distance'
  const edgeWeight = buildEdgeWeightGetter(edges, options)
  const weightedRatios = edges
    .map((edge) => {
      const geo = getPointDistance(edge.from, edge.to)
      if (geo <= 0) {
        return null
      }
      return edgeWeight({
        from: edge.from,
        to: edge.to,
        distance: edge.distance,
        time: edge.time,
        cost: edge.cost,
      }) / geo
    })
    .filter((value): value is number => value !== null && Number.isFinite(value) && value > 0)

  const minRatio = weightedRatios.length > 0 ? Math.min(...weightedRatios) : 0

  if (minRatio === 0 || optimizeBy === 'cost' || optimizeBy === 'composite') {
    return (from: string, to: string) => Number((getPointDistance(from, to) * minRatio).toFixed(2))
  }

  return (from: string, to: string) => Number((getPointDistance(from, to) * minRatio).toFixed(2))
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
  const weight = getRouteLegWeight(leg, edges, options)
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
  const heuristic = buildHeuristicGetter(edges, options)
  const nodes = Array.from(graph.keys())
  const distances = new Map<string, number>(nodes.map((node) => [node, Number.POSITIVE_INFINITY]))
  const frontierScores = new Map<string, number>(nodes.map((node) => [node, Number.POSITIVE_INFINITY]))
  const previousNode = new Map<string, string>()
  const previousLeg = new Map<string, RouteLeg>()
  const openSet = new Set<string>([start])
  const closedSet = new Set<string>()
  const traceSteps: DijkstraTraceStep[] = []

  distances.set(start, 0)
  frontierScores.set(start, heuristic(start, end))

  while (openSet.size > 0) {
    let current: string | null = null
    let minFrontier = Number.POSITIVE_INFINITY
    let minKnownDistance = Number.POSITIVE_INFINITY

    for (const node of openSet) {
      const frontierValue = frontierScores.get(node) ?? Number.POSITIVE_INFINITY
      const knownDistance = distances.get(node) ?? Number.POSITIVE_INFINITY
      if (frontierValue < minFrontier || (frontierValue === minFrontier && knownDistance < minKnownDistance)) {
        minFrontier = frontierValue
        minKnownDistance = knownDistance
        current = node
      }
    }

    if (!current || minFrontier === Number.POSITIVE_INFINITY) {
      break
    }

    openSet.delete(current)
    if (current === end) {
      break
    }
    closedSet.add(current)

    const relaxations: DijkstraRelaxation[] = []
    for (const leg of graph.get(current) ?? []) {
      if (closedSet.has(leg.to)) {
        continue
      }
      const candidateDistance = (distances.get(current) ?? Number.POSITIVE_INFINITY) + edgeWeight(leg)
      const candidate = candidateDistance + heuristic(leg.to, end)
      const accepted = candidateDistance < (distances.get(leg.to) ?? Number.POSITIVE_INFINITY)

      relaxations.push({
        ...buildWeightedEdge(leg, edges, options),
        accepted,
        candidateTotal: Number(candidate.toFixed(2)),
      })

      if (candidateDistance < (distances.get(leg.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(leg.to, candidateDistance)
        frontierScores.set(leg.to, candidate)
        previousNode.set(leg.to, current)
        previousLeg.set(leg.to, leg)
        openSet.add(leg.to)
      }
    }

    if (withTrace && relaxations.length > 0) {
      traceSteps.push({
        current,
        currentDistance: Number((distances.get(current) ?? minKnownDistance).toFixed(2)),
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
