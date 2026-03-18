import { reactive } from 'vue'
import { cityEdges } from '../data/graph'
import { spotByName, spots } from '../data/spots'
import { shortestPath, type OptimizeBy, type RouteLeg } from '../utils/dijkstra'

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

  const routeCityPath: string[] = []
  const legs: RouteLeg[] = []
  let totalDistance = 0
  let totalTime = 0
  let totalCost = 0

  for (let i = 0; i < cityWaypoints.length - 1; i++) {
    const fromCity = cityWaypoints[i]
    const toCity = cityWaypoints[i + 1]
    if (!fromCity || !toCity) {
      continue
    }
    if (fromCity === toCity) {
      if (routeCityPath.length === 0) {
        routeCityPath.push(fromCity)
      }
      continue
    }
    const segment = shortestPath(cityEdges, fromCity, toCity, { optimizeBy })
    if (routeCityPath.length === 0) {
      routeCityPath.push(...segment.path)
    } else {
      routeCityPath.push(...segment.path.slice(1))
    }
    legs.push(...segment.legs)
    totalDistance += segment.totalDistance
    totalTime += segment.totalTime
    totalCost += segment.totalCost
  }

  if (routeCityPath.length === 0) {
    const firstCity = cityWaypoints[0]
    if (firstCity) {
      routeCityPath.push(firstCity)
    }
  }

  return {
    startSpot,
    endSpot,
    passSpots: cleanedPass,
    optimizeBy,
    routeSpotNames,
    routeCityPath,
    legs,
    totalDistance,
    totalTime: Number(totalTime.toFixed(1)),
    totalCost,
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

  const metricCache = new Map<string, number>()
  const keyOf = (a: string, b: string) => `${a}=>${b}`
  const metricBetweenSpots = (fromSpot: string, toSpot: string) => {
    const key = keyOf(fromSpot, toSpot)
    const cached = metricCache.get(key)
    if (cached !== undefined) {
      return cached
    }
    const fromCity = spotByName.get(fromSpot)?.city
    const toCity = spotByName.get(toSpot)?.city
    if (!fromCity || !toCity) {
      return Number.POSITIVE_INFINITY
    }
    const metric = shortestPath(cityEdges, fromCity, toCity, { optimizeBy }).totalWeight
    metricCache.set(key, metric)
    return metric
  }

  const totalRouteMetric = (passOrder: string[]) => {
    const route = [startSpot, ...passOrder, endSpot]
    let total = 0
    for (let i = 0; i < route.length - 1; i++) {
      total += metricBetweenSpots(route[i] ?? '', route[i + 1] ?? '')
    }
    return total
  }

  const ordered: string[] = []
  for (const passSpot of passSpots) {
    if (ordered.length === 0) {
      ordered.push(passSpot)
      continue
    }

    let bestIndex = 0
    let bestMetric = Number.POSITIVE_INFINITY
    for (let idx = 0; idx <= ordered.length; idx++) {
      const candidate = [...ordered.slice(0, idx), passSpot, ...ordered.slice(idx)]
      const candidateMetric = totalRouteMetric(candidate)
      if (candidateMetric < bestMetric) {
        bestMetric = candidateMetric
        bestIndex = idx
      }
    }
    ordered.splice(bestIndex, 0, passSpot)
  }
  return ordered
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
