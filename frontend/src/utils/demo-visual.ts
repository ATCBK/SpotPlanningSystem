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

const TOTAL_DURATION = 16
const DEMO_BOUNDS = {
  minX: 8,
  maxX: 92,
  minY: 6,
  maxY: 92,
}

const demoCityPoints = expandPoints(cityPoints, DEMO_BOUNDS)

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

function polarPoint(centerX: number, centerY: number, radius: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: Number((centerX + Math.cos(angleRad) * radius).toFixed(2)),
    y: Number((centerY + Math.sin(angleRad) * radius).toFixed(2)),
  }
}

function clampPoint(point: { x: number; y: number }, padding = 10) {
  return {
    x: Number(Math.min(100 - padding, Math.max(padding, point.x)).toFixed(2)),
    y: Number(Math.min(100 - padding, Math.max(padding, point.y)).toFixed(2)),
  }
}

function buildScenicAnchorMap(spots: Spot[]) {
  const grouped = new Map<string, Spot[]>()
  for (const spot of spots) {
    grouped.set(spot.city, [...(grouped.get(spot.city) ?? []), spot])
  }

  const scenicAnchors = new Map<string, { x: number; y: number }>()
  for (const [city, citySpots] of grouped.entries()) {
    const anchor = demoCityPoints[city]
    if (!anchor) {
      citySpots.forEach((spot, index) => {
        scenicAnchors.set(spot.name, toScatterPoint(spot.name, index))
      })
      continue
    }

    const rotation = (hashString(city) % 120) - 60
    const count = citySpots.length
    const spread = count <= 1 ? 0 : Math.min(220, 70 + (count - 1) * 30)

    citySpots.forEach((spot, index) => {
      const ring = Math.floor(index / 5)
      const localIndex = index % 5
      const localCount = Math.min(5, count - ring * 5)
      const radius = 10.5 + ring * 4.6
      const angle =
        localCount <= 1
          ? rotation
          : rotation - spread / 2 + (spread * localIndex) / (localCount - 1)

      scenicAnchors.set(spot.name, clampPoint(polarPoint(anchor.x, anchor.y, radius, angle)))
    })
  }

  return scenicAnchors
}

function buildCityNodes(activeCities: string[]) {
  return Object.entries(demoCityPoints).map(([name, point], index) => {
    const scatter = toScatterPoint(name, index)
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

function getSpotMetricLabel(fromSpotName: string, toSpotName: string, optimizeBy: OptimizeBy) {
  const fromSpot = spotByName.get(fromSpotName)
  const toSpot = spotByName.get(toSpotName)
  if (!fromSpot || !toSpot) {
    return ''
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

function rankDecoySpotNames(fromSpotName: string, toSpotName: string, allSpots: Spot[], optimizeBy: OptimizeBy) {
  const fromSpot = spotByName.get(fromSpotName)
  if (!fromSpot) {
    return []
  }

  return allSpots
    .filter((spot) => spot.name !== fromSpotName && spot.name !== toSpotName)
    .map((spot) => {
      const segment = shortestPathWithTrace(cityEdges, fromSpot.city, spot.city, { optimizeBy })
      return {
        name: spot.name,
        totalWeight: segment.totalWeight,
        sameCity: fromSpot.city === spot.city,
      }
    })
    .sort((a, b) => {
      if (a.sameCity !== b.sameCity) {
        return a.sameCity ? -1 : 1
      }
      if (a.totalWeight !== b.totalWeight) {
        return a.totalWeight - b.totalWeight
      }
      return a.name.localeCompare(b.name)
    })
    .slice(0, 2)
    .map((item) => item.name)
}

function pushSpotTrace(trace: TraceCollections, routeSpotNames: string[], allSpots: Spot[], optimizeBy: OptimizeBy) {
  let cursor = 0.7

  routeSpotNames.slice(0, -1).forEach((fromSpotName, segmentIndex) => {
    const toSpotName = routeSpotNames[segmentIndex + 1]
    if (!toSpotName) {
      return
    }

    const focusStart = cursor
    const focusEnd = focusStart + 0.5
    trace.events.push(
      toEvent(`spot-focus-${segmentIndex}-${fromSpotName}`, 'focus-node', focusStart, focusEnd, segmentIndex, 0, fromSpotName),
    )
    cursor = focusEnd + 0.16

    const decoySpotNames = rankDecoySpotNames(fromSpotName, toSpotName, allSpots, optimizeBy)
    decoySpotNames.forEach((decoySpotName, decoyIndex) => {
      const edgeId = `spot-probe-${segmentIndex}-${fromSpotName}-${decoySpotName}`
      const probeStart = cursor
      const probeEnd = probeStart + 0.46
      const rejectStart = probeEnd - 0.08
      const rejectEnd = rejectStart + 0.4
      const label = getSpotMetricLabel(fromSpotName, decoySpotName, optimizeBy)

      trace.probeEdges.push(toEdge(edgeId, fromSpotName, decoySpotName, probeStart, probeEnd, label))
      trace.rejectedEdges.push(toEdge(edgeId, fromSpotName, decoySpotName, rejectStart, rejectEnd, label))
      trace.events.push(
        toEvent(`spot-probe-event-${edgeId}`, 'probe-edge', probeStart, probeEnd, segmentIndex, decoyIndex, decoySpotName, edgeId),
      )
      trace.events.push(
        toEvent(`spot-reject-event-${edgeId}`, 'reject-edge', rejectStart, rejectEnd, segmentIndex, decoyIndex, decoySpotName, edgeId),
      )
      cursor = rejectEnd + 0.18
    })

    const chosenEdgeId = `spot-final-${fromSpotName}-${toSpotName}`
    const chooseStart = cursor
    const chooseEnd = chooseStart + 0.68
    trace.events.push(
      toEvent(`spot-choose-${chosenEdgeId}`, 'choose-edge', chooseStart, chooseEnd, segmentIndex, decoySpotNames.length, toSpotName, chosenEdgeId),
    )
    trace.events.push(
      toEvent(
        `spot-settle-${segmentIndex}-${toSpotName}`,
        'settle-node',
        chooseEnd - 0.12,
        chooseEnd + 0.4,
        segmentIndex,
        decoySpotNames.length,
        toSpotName,
      ),
    )
    cursor = chooseEnd + 0.42
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
  const routeSet = new Set(routeSpotNames)
  const nodes = spots.map((spot, index) => {
    const scatter = toScatterPoint(spot.name, index)
    const active = routeSet.has(spot.name)
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

  const trace = { probeEdges: [] as DemoEdge[], rejectedEdges: [] as DemoEdge[], finalEdges: [] as DemoEdge[], events: [] as DemoEvent[] }
  pushSpotTrace(trace, routeSpotNames, spots, optimizeBy)

  const finalEdges =
    routeSpotNames.length > 1
      ? routeSpotNames.slice(0, -1).map((from, index) => {
          const to = routeSpotNames[index + 1] ?? ''
          const fromSpot = spotByName.get(from)
          const toSpot = spotByName.get(to)
          const label =
            fromSpot && toSpot
              ? formatLegWeightLabel(
                  {
                    from,
                    to,
                    distance: shortestPathWithTrace(cityEdges, fromSpot.city, toSpot.city, { optimizeBy }).totalDistance,
                    time: shortestPathWithTrace(cityEdges, fromSpot.city, toSpot.city, { optimizeBy }).totalTime,
                    cost: shortestPathWithTrace(cityEdges, fromSpot.city, toSpot.city, { optimizeBy }).totalCost,
                  },
                  cityEdges,
                  { optimizeBy },
                )
              : ''

          return toEdge(`spot-final-${from}-${to}`, from, to, 10.5 + index * 0.9, TOTAL_DURATION, label)
        })
      : []

  return {
    totalDuration: TOTAL_DURATION,
    nodes,
    probeEdges: trace.probeEdges.length > 0 ? trace.probeEdges : finalEdges,
    rejectedEdges: trace.rejectedEdges,
    finalEdges,
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
