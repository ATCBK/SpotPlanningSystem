import { cityEdges } from '../data/graph'
import type { Spot } from '../data/spots'
import { spotByName } from '../data/spots'
import { formatLegWeightLabel, shortestPathWithTrace, type DijkstraRelaxation, type OptimizeBy } from './dijkstra'
import { cityPoints } from './route-visual'

export type DemoNode = {
  id: string
  label: string
  x: number
  y: number
  scatterX: number
  scatterY: number
  iconName: string
  active: boolean
  role: 'start' | 'end' | 'pass' | 'ambient'
}

export type DemoEdge = {
  id: string
  from: string
  to: string
  start: number
  end: number
  label: string
}

export type DemoEventType = 'focus-node' | 'probe-edge' | 'reject-edge' | 'choose-edge' | 'settle-node'

export type DemoEvent = {
  id: string
  type: DemoEventType
  start: number
  end: number
  segmentIndex: number
  stepIndex: number
  nodeId?: string
  edgeId?: string
}

export type DemoScene = {
  totalDuration: number
  nodes: DemoNode[]
  probeEdges: DemoEdge[]
  rejectedEdges: DemoEdge[]
  finalEdges: DemoEdge[]
  events: DemoEvent[]
}

type TraceCollections = {
  probeEdges: DemoEdge[]
  rejectedEdges: DemoEdge[]
  finalEdges: DemoEdge[]
  events: DemoEvent[]
}

type Timed = {
  start: number
  end: number
}

const TOTAL_DURATION = 24
const SPOT_PROBE_SETTLE_GAP = 0.46
const SPOT_PROBE_HOLD = 0.34
const DEMO_BOUNDS = {
  minX: 8,
  maxX: 92,
  minY: 6,
  maxY: 92,
}

const demoCityPoints = expandPoints(cityPoints, DEMO_BOUNDS)
const CITY_SPINE_Y = [20, 44, 28, 62, 74, 40, 58]
const CITY_AMBIENT_SLOTS = [
  { x: 18, y: 12 },
  { x: 36, y: 14 },
  { x: 58, y: 12 },
  { x: 80, y: 14 },
  { x: 22, y: 86 },
  { x: 46, y: 88 },
  { x: 72, y: 86 },
]

function hashString(value: string) {
  return Array.from(value).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0)
}

function toScatterPoint(label: string, index: number) {
  const seed = hashString(label) + index * 37
  return {
    x: 10 + (seed % 78),
    y: 12 + ((seed * 7) % 72),
  }
}

function toEdge(id: string, from: string, to: string, start: number, end: number, label: string): DemoEdge {
  return { id, from, to, start, end, label }
}

function toEvent(
  id: string,
  type: DemoEventType,
  start: number,
  end: number,
  segmentIndex: number,
  stepIndex: number,
  nodeId?: string,
  edgeId?: string,
): DemoEvent {
  return { id, type, start, end, segmentIndex, stepIndex, nodeId, edgeId }
}

function expandPoints(
  points: Record<string, { x: number; y: number }>,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
) {
  const entries = Object.entries(points)
  const xs = entries.map(([, point]) => point.x)
  const ys = entries.map(([, point]) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return Object.fromEntries(
    entries.map(([name, point]) => {
      const xRatio = maxX === minX ? 0.5 : (point.x - minX) / (maxX - minX)
      const yRatio = maxY === minY ? 0.5 : (point.y - minY) / (maxY - minY)

      return [
        name,
        {
          x: Number((bounds.minX + xRatio * (bounds.maxX - bounds.minX)).toFixed(2)),
          y: Number((bounds.minY + yRatio * (bounds.maxY - bounds.minY)).toFixed(2)),
        },
      ]
    }),
  ) as Record<string, { x: number; y: number }>
}

function clampPoint(point: { x: number; y: number }, padding = 10) {
  return {
    x: Number(Math.min(100 - padding, Math.max(padding, point.x)).toFixed(2)),
    y: Number(Math.min(100 - padding, Math.max(padding, point.y)).toFixed(2)),
  }
}

function buildScenicAnchorMap(spots: Spot[]) {
  const scenicAnchors = new Map<string, { x: number; y: number }>()
  const orderedSpots = [...spots].sort((a, b) => hashString(a.name) - hashString(b.name))
  const count = orderedSpots.length
  const columns = Math.max(4, Math.ceil(Math.sqrt(count * 1.45)))
  const rows = Math.max(3, Math.ceil(count / columns))
  const usableWidth = DEMO_BOUNDS.maxX - DEMO_BOUNDS.minX
  const usableHeight = DEMO_BOUNDS.maxY - DEMO_BOUNDS.minY
  const cellWidth = usableWidth / columns
  const cellHeight = usableHeight / rows

  orderedSpots.forEach((spot, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const point = clampPoint(
      {
        x: DEMO_BOUNDS.minX + cellWidth * (column + 0.5),
        y: DEMO_BOUNDS.minY + cellHeight * (row + 0.5),
      },
      8,
    )

    scenicAnchors.set(spot.name, point)
  })

  return scenicAnchors
}

function buildCityAnchorMap(activeCities: string[]) {
  const anchors = new Map<string, { x: number; y: number }>()
  const activeEntries = activeCities.filter((city, index) => activeCities.indexOf(city) === index)
  const activeCount = activeEntries.length
  const minX = 14
  const maxX = 90
  const step = activeCount <= 1 ? 0 : (maxX - minX) / (activeCount - 1)

  activeEntries.forEach((city, index) => {
    anchors.set(city, {
      x: Number((minX + step * index).toFixed(2)),
      y: CITY_SPINE_Y[index % CITY_SPINE_Y.length] ?? 48,
    })
  })

  const ambientEntries = Object.keys(demoCityPoints).filter((city) => !anchors.has(city))
  ambientEntries.forEach((city, index) => {
    const fallbackPoint = demoCityPoints[city] ?? { x: 50, y: 50 }
    const slot = CITY_AMBIENT_SLOTS[index] ?? fallbackPoint
    anchors.set(city, clampPoint(slot, 8))
  })

  return anchors
}

function buildCityNodes(activeCities: string[]) {
  const cityAnchors = buildCityAnchorMap(activeCities)
  return Object.entries(demoCityPoints).map(([name], index) => {
    const scatter = toScatterPoint(name, index)
    const point = cityAnchors.get(name) ?? demoCityPoints[name] ?? { x: 50, y: 50 }
    return {
      id: name,
      label: name,
      x: point.x,
      y: point.y,
      scatterX: scatter.x,
      scatterY: scatter.y,
      iconName: name,
      active: activeCities.includes(name),
      role:
        name === activeCities[0]
          ? 'start'
          : name === activeCities[activeCities.length - 1]
            ? 'end'
            : activeCities.includes(name)
              ? 'pass'
              : 'ambient',
      } satisfies DemoNode
  })
}

function pushTimed<T extends Timed>(items: T[], scale: number) {
  items.forEach((item) => {
    item.start = Number((item.start * scale).toFixed(2))
    item.end = Number((item.end * scale).toFixed(2))
  })
}

function normalizeTimeline(trace: TraceCollections, totalDuration: number) {
  const latestTime = Math.max(
    1,
    ...trace.probeEdges.map((edge) => edge.end),
    ...trace.rejectedEdges.map((edge) => edge.end),
    ...trace.finalEdges.map((edge) => edge.end),
    ...trace.events.map((event) => event.end),
  )

  const scale = totalDuration / latestTime
  pushTimed(trace.probeEdges, scale)
  pushTimed(trace.rejectedEdges, scale)
  pushTimed(trace.finalEdges, scale)
  pushTimed(trace.events, scale)
}

function buildSameCitySpotMetric(
  fromSpotName: string,
  toSpotName: string,
  scenicAnchors: Map<string, { x: number; y: number }>,
) {
  const fromAnchor = scenicAnchors.get(fromSpotName)
  const toAnchor = scenicAnchors.get(toSpotName)
  if (!fromAnchor || !toAnchor) {
    return { distance: 8, time: 0.4, cost: 12 }
  }

  const scenicDistance = Math.max(6, Math.round(Math.hypot(toAnchor.x - fromAnchor.x, toAnchor.y - fromAnchor.y) * 2.2))
  return {
    distance: scenicDistance,
    time: Number((Math.max(0.4, scenicDistance / 28)).toFixed(1)),
    cost: Math.max(10, Math.round(scenicDistance * 1.5)),
  }
}

function getSpotMetricLabel(
  fromSpotName: string,
  toSpotName: string,
  optimizeBy: OptimizeBy,
  scenicAnchors: Map<string, { x: number; y: number }>,
) {
  const fromSpot = spotByName.get(fromSpotName)
  const toSpot = spotByName.get(toSpotName)
  if (!fromSpot || !toSpot) {
    return ''
  }

  if (fromSpot.city === toSpot.city) {
    const sameCityMetric = buildSameCitySpotMetric(fromSpotName, toSpotName, scenicAnchors)
    return formatLegWeightLabel(
      {
        from: fromSpotName,
        to: toSpotName,
        distance: sameCityMetric.distance,
        time: sameCityMetric.time,
        cost: sameCityMetric.cost,
      },
      cityEdges,
      { optimizeBy },
    )
  }

  const segment = shortestPathWithTrace(cityEdges, fromSpot.city, toSpot.city, { optimizeBy })
  return formatLegWeightLabel(
    {
      from: fromSpotName,
      to: toSpotName,
      distance: segment.totalDistance,
      time: segment.totalTime,
      cost: segment.totalCost,
    },
    cityEdges,
    { optimizeBy },
  )
}

function getSpotRouteWeight(
  fromSpotName: string,
  toSpotName: string,
  optimizeBy: OptimizeBy,
  scenicAnchors: Map<string, { x: number; y: number }>,
) {
  const fromSpot = spotByName.get(fromSpotName)
  const toSpot = spotByName.get(toSpotName)
  if (!fromSpot || !toSpot) {
    return Number.POSITIVE_INFINITY
  }

  if (fromSpot.city === toSpot.city) {
    const sameCityMetric = buildSameCitySpotMetric(fromSpotName, toSpotName, scenicAnchors)
    if (optimizeBy === 'distance') {
      return sameCityMetric.distance
    }
    if (optimizeBy === 'cost') {
      return sameCityMetric.cost
    }
    return Number((sameCityMetric.distance * 0.4 + sameCityMetric.time * 0.3 + sameCityMetric.cost * 0.3).toFixed(2))
  }

  return shortestPathWithTrace(cityEdges, fromSpot.city, toSpot.city, { optimizeBy }).totalWeight
}

type SpotCandidateMetric = {
  name: string
  totalWeight: number
  label: string
}

function getRankedSpotCandidates(
  fromSpotName: string,
  selectedCandidates: string[],
  optimizeBy: OptimizeBy,
  scenicAnchors: Map<string, { x: number; y: number }>,
) {
  if (!spotByName.get(fromSpotName)) {
    return []
  }

  return selectedCandidates
    .filter((spotName) => spotName !== fromSpotName)
    .map((spotName) => {
      const totalWeight = getSpotRouteWeight(fromSpotName, spotName, optimizeBy, scenicAnchors)
      if (!Number.isFinite(totalWeight)) {
        return null
      }
      const label = getSpotMetricLabel(fromSpotName, spotName, optimizeBy, scenicAnchors)
      return {
        name: spotName,
        totalWeight,
        label,
      }
    })
    .filter((item): item is SpotCandidateMetric => Boolean(item))
    .sort((a, b) => {
      if (a.totalWeight !== b.totalWeight) {
        return a.totalWeight - b.totalWeight
      }
      return a.name.localeCompare(b.name)
    })
}

function buildGreedySpotRoute(
  selectedSpotNames: string[],
  optimizeBy: OptimizeBy,
  scenicAnchors: Map<string, { x: number; y: number }>,
) {
  if (selectedSpotNames.length <= 2) {
    return [...selectedSpotNames]
  }

  const startSpotName = selectedSpotNames[0]
  const endSpotName = selectedSpotNames[selectedSpotNames.length - 1]
  if (!startSpotName || !endSpotName) {
    return [...selectedSpotNames]
  }

  const remainingIntermediateSpotNames = new Set(selectedSpotNames.slice(1, -1))
  const orderedRoute = [startSpotName]
  let currentSpotName = startSpotName

  while (remainingIntermediateSpotNames.size > 0) {
    const rankedCandidates = getRankedSpotCandidates(
      currentSpotName,
      Array.from(remainingIntermediateSpotNames),
      optimizeBy,
      scenicAnchors,
    )
    const nextSpotName = rankedCandidates[0]?.name
    if (!nextSpotName) {
      break
    }
    orderedRoute.push(nextSpotName)
    remainingIntermediateSpotNames.delete(nextSpotName)
    currentSpotName = nextSpotName
  }

  orderedRoute.push(endSpotName)
  return orderedRoute
}

function pushSpotTrace(
  trace: TraceCollections,
  routeSpotNames: string[],
  _allSpots: Spot[],
  optimizeBy: OptimizeBy,
  scenicAnchors: Map<string, { x: number; y: number }>,
) {
  let cursor = 0.7

  routeSpotNames.slice(0, -1).forEach((fromSpotName, segmentIndex) => {
    const toSpotName = routeSpotNames[segmentIndex + 1]
    if (!toSpotName) {
      return
    }

    const terminalEndSpotName = routeSpotNames[routeSpotNames.length - 1] ?? toSpotName
    const visitedSpotNames = new Set(routeSpotNames.slice(0, segmentIndex + 1))
    const remainingIntermediateSpotNames = routeSpotNames
      .slice(segmentIndex + 1, -1)
      .filter((spotName) => !visitedSpotNames.has(spotName))
    const roundCandidateSpotNames =
      remainingIntermediateSpotNames.length > 0
        ? remainingIntermediateSpotNames
        : visitedSpotNames.has(terminalEndSpotName)
          ? []
          : [terminalEndSpotName]
    const rankedCandidates = getRankedSpotCandidates(
      fromSpotName,
      roundCandidateSpotNames,
      optimizeBy,
      scenicAnchors,
    )

    const focusStart = cursor
    const focusEnd = focusStart + 0.82
    trace.events.push(
      toEvent(`spot-focus-${segmentIndex}-${fromSpotName}`, 'focus-node', focusStart, focusEnd, segmentIndex, 0, fromSpotName),
    )
    cursor = focusEnd + 0.2

    let chosenCandidateLabel = ''
    let chosenCandidateIndex = -1

    rankedCandidates.forEach((candidate, candidateIndex) => {
      const candidateSpotName = candidate.name
      const edgeId = `spot-probe-${segmentIndex}-${fromSpotName}-${candidateSpotName}`
      const probeStart = cursor
      const probeEnd = probeStart + 0.68
      const label = candidate.label

      trace.probeEdges.push(toEdge(edgeId, fromSpotName, candidateSpotName, probeStart, probeEnd, label))
      trace.events.push(
        toEvent(`spot-probe-event-${edgeId}`, 'probe-edge', probeStart, probeEnd, segmentIndex, candidateIndex, candidateSpotName, edgeId),
      )

      if (candidateSpotName !== toSpotName) {
        const rejectStart = probeEnd - 0.08
        const rejectEnd = rejectStart + 0.52
        trace.rejectedEdges.push(toEdge(edgeId, fromSpotName, candidateSpotName, rejectStart, rejectEnd, label))
        trace.events.push(
          toEvent(`spot-reject-event-${edgeId}`, 'reject-edge', rejectStart, rejectEnd, segmentIndex, candidateIndex, candidateSpotName, edgeId),
        )
        cursor = rejectEnd + 0.18
        return
      }

      chosenCandidateLabel = label
      chosenCandidateIndex = candidateIndex
      cursor = probeEnd + SPOT_PROBE_HOLD
    })

    if (!chosenCandidateLabel) {
      return
    }

    const chooseStart = cursor + SPOT_PROBE_SETTLE_GAP
    const chooseEnd = chooseStart + 1.2
    const finalEdgeId = `spot-final-${fromSpotName}-${toSpotName}`
    trace.finalEdges.push(toEdge(finalEdgeId, fromSpotName, toSpotName, chooseStart, chooseEnd, chosenCandidateLabel))
    trace.events.push(
      toEvent(
        `spot-choose-${finalEdgeId}`,
        'choose-edge',
        chooseStart,
        chooseEnd,
        segmentIndex,
        Math.max(chosenCandidateIndex, 0),
        toSpotName,
        finalEdgeId,
      ),
    )
    trace.events.push(
      toEvent(
        `spot-settle-${segmentIndex}-${toSpotName}`,
        'settle-node',
        chooseEnd - 0.1,
        chooseEnd + 0.46,
        segmentIndex,
        Math.max(chosenCandidateIndex, 0),
        toSpotName,
      ),
    )
    cursor = chooseEnd + 0.46
  })

  normalizeTimeline(trace, TOTAL_DURATION)
}

function pushTraceEdges(
  trace: TraceCollections,
  routeCities: string[],
  optimizeBy: OptimizeBy,
  mapNodeId: (cityName: string) => string,
) {
  let cursor = 0.9
  let segmentIndex = 0

  for (let i = 0; i < routeCities.length - 1; i++) {
    const from = routeCities[i]
    const to = routeCities[i + 1]
    if (!from || !to || from === to) {
      continue
    }

    const pathTrace = shortestPathWithTrace(cityEdges, from, to, { optimizeBy })
    let finalEdgePointer = 0

    pathTrace.traceSteps.forEach((step, stepIndex) => {
      const currentNodeId = mapNodeId(step.current)
      const focusStart = cursor
      const focusEnd = focusStart + 0.56

      trace.events.push(
        toEvent(
          `focus-${segmentIndex}-${stepIndex}-${step.current}`,
          'focus-node',
          focusStart,
          focusEnd,
          segmentIndex,
          stepIndex,
          currentNodeId,
        ),
      )

      cursor = focusEnd + 0.16

      step.relaxations.forEach((relaxation: DijkstraRelaxation, relaxIndex) => {
        const edgeId = `trace-${segmentIndex}-${stepIndex}-${relaxation.from}-${relaxation.to}`
        const edgeStart = cursor
        const edgeEnd = edgeStart + 0.52
        const mappedFrom = mapNodeId(relaxation.from)
        const mappedTo = mapNodeId(relaxation.to)

        trace.probeEdges.push(toEdge(edgeId, mappedFrom, mappedTo, edgeStart, edgeEnd, relaxation.label))
        trace.events.push(
          toEvent(
            `probe-${edgeId}`,
            'probe-edge',
            edgeStart,
            edgeEnd,
            segmentIndex,
            stepIndex,
            mappedTo,
            edgeId,
          ),
        )

        cursor = edgeEnd + 0.18

        if (!relaxation.accepted) {
          const rejectStart = cursor - 0.12
          const rejectEnd = rejectStart + 0.42

          trace.rejectedEdges.push(toEdge(edgeId, mappedFrom, mappedTo, rejectStart, rejectEnd, relaxation.label))
          trace.events.push(
            toEvent(
              `reject-${edgeId}`,
              'reject-edge',
              rejectStart,
              rejectEnd,
              segmentIndex,
              stepIndex,
              mappedTo,
              edgeId,
            ),
          )
        }

        if (relaxIndex === step.relaxations.length - 1) {
          cursor += 0.12
        }
      })

      const chosenEdge = pathTrace.finalPathEdges[finalEdgePointer]
      if (chosenEdge && chosenEdge.from === step.current) {
        const finalEdgeId = `final-${segmentIndex}-${chosenEdge.from}-${chosenEdge.to}`
        const mappedFrom = mapNodeId(chosenEdge.from)
        const mappedTo = mapNodeId(chosenEdge.to)
        const chooseStart = cursor
        const chooseEnd = chooseStart + 0.72

        trace.finalEdges.push(toEdge(finalEdgeId, mappedFrom, mappedTo, chooseStart, chooseEnd, chosenEdge.label))
        trace.events.push(
          toEvent(
            `choose-${finalEdgeId}`,
            'choose-edge',
            chooseStart,
            chooseEnd,
            segmentIndex,
            stepIndex,
            mappedTo,
            finalEdgeId,
          ),
        )

        const settleStart = chooseEnd - 0.12
        const settleEnd = chooseEnd + 0.44
        trace.events.push(
          toEvent(
            `settle-${segmentIndex}-${stepIndex}-${chosenEdge.to}`,
            'settle-node',
            settleStart,
            settleEnd,
            segmentIndex,
            stepIndex,
            mappedTo,
          ),
        )

        finalEdgePointer += 1
        cursor = settleEnd + 0.3
      } else {
        cursor += 0.18
      }
    })

    segmentIndex += 1
    cursor += 0.32
  }

  normalizeTimeline(trace, TOTAL_DURATION)
}

export function buildSpotDemoScene(routeSpotNames: string[], spots: Spot[], optimizeBy: OptimizeBy = 'distance'): DemoScene {
  const scenicAnchors = buildScenicAnchorMap(spots)
  const trace = { probeEdges: [] as DemoEdge[], rejectedEdges: [] as DemoEdge[], finalEdges: [] as DemoEdge[], events: [] as DemoEvent[] }
  const orderedRouteSpotNames = buildGreedySpotRoute(routeSpotNames, optimizeBy, scenicAnchors)
  pushSpotTrace(trace, orderedRouteSpotNames, spots, optimizeBy, scenicAnchors)
  const activeSpotIds = new Set(routeSpotNames)
  const nodes = spots.map((spot, index) => {
    const scatter = toScatterPoint(spot.name, index)
    const active = activeSpotIds.has(spot.name)
    const routeIndex = routeSpotNames.indexOf(spot.name)
    const anchor = scenicAnchors.get(spot.name) ?? scatter

    return {
      id: spot.name,
      label: spot.name,
      x: anchor.x,
      y: anchor.y,
      scatterX: scatter.x,
      scatterY: scatter.y,
      iconName: spot.name,
      active,
      role:
        routeIndex === 0
          ? 'start'
          : routeIndex === routeSpotNames.length - 1
            ? 'end'
            : active
              ? 'pass'
              : 'ambient',
    } satisfies DemoNode
  })

  return {
    totalDuration: TOTAL_DURATION,
    nodes,
    probeEdges: trace.probeEdges,
    rejectedEdges: trace.rejectedEdges,
    finalEdges: trace.finalEdges,
    events: trace.events,
  }
}

export function buildCityDemoScene(routeCityPath: string[], optimizeBy: OptimizeBy = 'distance'): DemoScene {
  const nodes = buildCityNodes(routeCityPath)
  const trace = { probeEdges: [] as DemoEdge[], rejectedEdges: [] as DemoEdge[], finalEdges: [] as DemoEdge[], events: [] as DemoEvent[] }
  pushTraceEdges(trace, routeCityPath, optimizeBy, (cityName) => cityName)

  return {
    totalDuration: TOTAL_DURATION,
    nodes,
    probeEdges: trace.probeEdges,
    rejectedEdges: trace.rejectedEdges,
    finalEdges: trace.finalEdges,
    events: trace.events,
  }
}
