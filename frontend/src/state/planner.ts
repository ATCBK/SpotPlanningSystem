import { reactive } from 'vue'
import { cityEdges } from '../data/graph'
import { spotByName, spots } from '../data/spots'
import { getRouteLegWeight, shortestPath, type OptimizeBy, type RouteLeg } from '../utils/dijkstra'

export type RoutePlan = {
  startSpot: string
  endSpot: string
  passSpots: string[]
  optimizeBy: OptimizeBy
  routeSpotNames: string[]
  routeCityPath: string[]
  legs: RouteLeg[]
  totalDistance: number
  totalTime: number
  totalCost: number
  confirmedAt: number
}

type PlannerState = {
  selectedSpotNames: string[]
  currentPlan: RoutePlan | null
}

const STORAGE_KEY = 'spot-planner-state'
export const defaultOptimizeBy: OptimizeBy = 'distance'

function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { selectedSpotNames: [], currentPlan: null }
    }
    const parsed = JSON.parse(raw) as PlannerState
    const currentPlan = parsed.currentPlan
      ? { ...parsed.currentPlan, optimizeBy: parsed.currentPlan.optimizeBy ?? defaultOptimizeBy }
      : null
    return {
      selectedSpotNames: Array.isArray(parsed.selectedSpotNames) ? parsed.selectedSpotNames : [],
      currentPlan,
    }
  } catch {
    return { selectedSpotNames: [], currentPlan: null }
  }
}

const initial = typeof window !== 'undefined' ? loadState() : { selectedSpotNames: [], currentPlan: null }

export const plannerState = reactive<PlannerState>({
  selectedSpotNames: initial.selectedSpotNames,
  currentPlan: initial.currentPlan,
})

function saveState() {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plannerState))
}

export function setSelectedSpots(spotNames: string[]) {
  plannerState.selectedSpotNames = [...new Set(spotNames)].filter((name) => spotByName.has(name))
  saveState()
}

export function toggleSelectedSpot(name: string) {
  if (!spotByName.has(name)) {
    return
  }
  const set = new Set(plannerState.selectedSpotNames)
  if (set.has(name)) {
    set.delete(name)
  } else {
    set.add(name)
  }
  plannerState.selectedSpotNames = Array.from(set)
  saveState()
}

export function buildRoutePlan(
  startSpot: string,
  endSpot: string,
  passSpots: string[],
  optimizeBy: OptimizeBy = defaultOptimizeBy,
): RoutePlan {
  if (!spotByName.has(startSpot) || !spotByName.has(endSpot)) {
    throw new Error('Start or end spot does not exist')
  }

  const cleanedPass = [...new Set(passSpots)].filter(
    (name) => name !== startSpot && name !== endSpot && spotByName.has(name),
  )
  const orderedPass = reorderPassSpotsByShortestPath(startSpot, endSpot, cleanedPass, optimizeBy)
  const routeSpotNames = [startSpot, ...orderedPass, endSpot]
  const cityWaypoints = routeSpotNames.map((name) => {
    const spot = spotByName.get(name)
    if (!spot) {
      throw new Error(`Unknown spot: ${name}`)
    }
    return spot.city
  })
  const requiredCities = cityWaypoints.filter((city, index) => index === 0 || city !== cityWaypoints[index - 1])
  const cityRoute = buildCityRoutePlan(requiredCities, optimizeBy)

  return {
    startSpot,
    endSpot,
    passSpots: cleanedPass,
    optimizeBy,
    routeSpotNames,
    routeCityPath: cityRoute.path,
    legs: cityRoute.legs,
    totalDistance: cityRoute.totalDistance,
    totalTime: Number(cityRoute.totalTime.toFixed(1)),
    totalCost: cityRoute.totalCost,
    confirmedAt: Date.now(),
  }
}

export function setCurrentPlan(plan: RoutePlan) {
  plannerState.currentPlan = plan
  saveState()
}

function reorderPassSpotsByShortestPath(
  startSpot: string,
  endSpot: string,
  passSpots: string[],
  optimizeBy: OptimizeBy,
) {
  if (passSpots.length <= 1) {
    return passSpots
  }

  let bestOrder = passSpots
  let bestWeight = Number.POSITIVE_INFINITY

  const walk = (prefix: string[], remaining: string[]) => {
    if (remaining.length === 0) {
      const routeSpots = [startSpot, ...prefix, endSpot]
      const requiredCities = routeSpots
        .map((name) => {
          const city = spotByName.get(name)?.city
          if (!city) {
            throw new Error(`Unknown spot: ${name}`)
          }
          return city
        })
        .filter((city, index, cities) => index === 0 || city !== cities[index - 1])

      try {
        const cityRoute = buildCityRoutePlan(requiredCities, optimizeBy)
        if (cityRoute.totalWeight < bestWeight) {
          bestWeight = cityRoute.totalWeight
          bestOrder = [...prefix]
        }
      } catch {
        return
      }
      return
    }

    for (let index = 0; index < remaining.length; index++) {
      const next = remaining[index]
      if (!next) {
        continue
      }
      const rest = remaining.filter((_, restIndex) => restIndex !== index)
      walk([...prefix, next], rest)
    }
  }

  walk([], passSpots)
  return bestOrder
}

type CityRouteResult = {
  path: string[]
  legs: RouteLeg[]
  totalDistance: number
  totalTime: number
  totalCost: number
  totalWeight: number
}

type CityRouteCandidate = CityRouteResult & {
  nextRequiredIndex: number
}

function buildCityRoutePlan(requiredCities: string[], optimizeBy: OptimizeBy): CityRouteResult {
  try {
    return buildSimpleCityRoute(requiredCities, optimizeBy)
  } catch {
    return buildCompressedCityRoute(requiredCities, optimizeBy)
  }
}

function buildCompressedCityRoute(requiredCities: string[], optimizeBy: OptimizeBy): CityRouteResult {
  if (requiredCities.length === 0) {
    return { path: [], legs: [], totalDistance: 0, totalTime: 0, totalCost: 0, totalWeight: 0 }
  }

  const path = requiredCities.filter((city, index) => index === 0 || city !== requiredCities[index - 1])
  const legs: RouteLeg[] = []
  let totalDistance = 0
  let totalTime = 0
  let totalCost = 0
  let totalWeight = 0

  for (let index = 0; index < path.length - 1; index++) {
    const fromCity = path[index]
    const toCity = path[index + 1]
    if (!fromCity || !toCity) {
      continue
    }

    const segment = shortestPath(cityEdges, fromCity, toCity, { optimizeBy })
    legs.push({
      from: fromCity,
      to: toCity,
      distance: segment.totalDistance,
      time: segment.totalTime,
      cost: segment.totalCost,
    })
    totalDistance += segment.totalDistance
    totalTime += segment.totalTime
    totalCost += segment.totalCost
    totalWeight += segment.totalWeight
  }

  return {
    path,
    legs,
    totalDistance,
    totalTime,
    totalCost,
    totalWeight,
  }
}

function buildSimpleCityRoute(requiredCities: string[], optimizeBy: OptimizeBy): CityRouteResult {
  if (requiredCities.length === 0) {
    return { path: [], legs: [], totalDistance: 0, totalTime: 0, totalCost: 0, totalWeight: 0 }
  }

  if (requiredCities.length === 1) {
    const onlyCity = requiredCities[0]
    if (!onlyCity) {
      throw new Error('Expected a city for a single-city route')
    }
    return {
      path: [onlyCity],
      legs: [],
      totalDistance: 0,
      totalTime: 0,
      totalCost: 0,
      totalWeight: 0,
    }
  }

  const graph = new Map<string, RouteLeg[]>()
  for (const edge of cityEdges) {
    const forward: RouteLeg = { from: edge.from, to: edge.to, distance: edge.distance, time: edge.time, cost: edge.cost }
    const backward: RouteLeg = { from: edge.to, to: edge.from, distance: edge.distance, time: edge.time, cost: edge.cost }
    graph.set(edge.from, [...(graph.get(edge.from) ?? []), forward])
    graph.set(edge.to, [...(graph.get(edge.to) ?? []), backward])
  }

  const lastRequired = requiredCities[requiredCities.length - 1]

  const dfs = (
    currentCity: string,
    nextRequiredIndex: number,
    visited: Set<string>,
  ): CityRouteCandidate | null => {
    let advancedIndex = nextRequiredIndex
    if (requiredCities[advancedIndex] === currentCity) {
      advancedIndex += 1
    }

    if (currentCity === lastRequired && advancedIndex === requiredCities.length) {
      return {
        path: [currentCity],
        legs: [],
        totalDistance: 0,
        totalTime: 0,
        totalCost: 0,
        totalWeight: 0,
        nextRequiredIndex: advancedIndex,
      }
    }

    let best: CityRouteCandidate | null = null
    for (const leg of graph.get(currentCity) ?? []) {
      if (visited.has(leg.to)) {
        continue
      }

      const nextVisited = new Set(visited)
      nextVisited.add(leg.to)
      const candidate = dfs(leg.to, advancedIndex, nextVisited)
      if (!candidate) {
        continue
      }

      const totalWeight = getRouteLegWeight(leg, cityEdges, { optimizeBy }) + candidate.totalWeight
      const assembled: CityRouteCandidate = {
        path: [currentCity, ...candidate.path],
        legs: [leg, ...candidate.legs],
        totalDistance: leg.distance + candidate.totalDistance,
        totalTime: leg.time + candidate.totalTime,
        totalCost: leg.cost + candidate.totalCost,
        totalWeight,
        nextRequiredIndex: candidate.nextRequiredIndex,
      }

      if (!best || assembled.totalWeight < best.totalWeight) {
        best = assembled
      }
    }

    return best
  }

  const startCity = requiredCities[0]
  if (!startCity) {
    throw new Error('Expected a start city for city route planning')
  }
  const result = dfs(startCity, 1, new Set([startCity]))
  if (!result) {
    throw new Error(`No simple route found for required cities: ${requiredCities.join(' -> ')}`)
  }

  return {
    path: result.path,
    legs: result.legs,
    totalDistance: result.totalDistance,
    totalTime: result.totalTime,
    totalCost: result.totalCost,
    totalWeight: result.totalWeight,
  }
}

export function syncCurrentPlanFromSelection(
  startSpot: string,
  endSpot: string,
  passSpots: string[],
  optimizeBy: OptimizeBy = defaultOptimizeBy,
) {
  const plan = buildRoutePlan(startSpot, endSpot, passSpots, optimizeBy)
  plannerState.currentPlan = plan
  plannerState.selectedSpotNames = plan.routeSpotNames
  saveState()
  return plan
}

export const defaultSpotNames = {
  start: spots[0]?.name ?? '河南博物院',
  end: spots.find((spot) => spot.name === '清明上河园')?.name ?? spots[1]?.name ?? '清明上河园',
}
