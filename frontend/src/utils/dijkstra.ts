import type { CityEdge } from '../data/graph'

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
}

type Graph = Map<string, RouteLeg[]>

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

export function shortestPath(edges: CityEdge[], start: string, end: string): PathResult {
  if (start === end) {
    return { path: [start], legs: [], totalDistance: 0, totalTime: 0, totalCost: 0 }
  }

  const graph = buildGraph(edges)
  const nodes = Array.from(graph.keys())
  const distances = new Map<string, number>(nodes.map((node) => [node, Number.POSITIVE_INFINITY]))
  const previousNode = new Map<string, string>()
  const previousLeg = new Map<string, RouteLeg>()
  const unvisited = new Set(nodes)

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

    for (const leg of graph.get(current) ?? []) {
      if (!unvisited.has(leg.to)) {
        continue
      }
      const candidate = (distances.get(current) ?? Number.POSITIVE_INFINITY) + leg.distance
      if (candidate < (distances.get(leg.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(leg.to, candidate)
        previousNode.set(leg.to, current)
        previousLeg.set(leg.to, leg)
      }
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

  return {
    path,
    legs,
    totalDistance,
    totalTime,
    totalCost,
  }
}
