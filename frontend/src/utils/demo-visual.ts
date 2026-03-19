import { buildRecommendLayout } from './recommend-layout'
import { cityPoints } from './route-visual'
import type { Spot } from '../data/spots'

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
}

export type DemoScene = {
  totalDuration: number
  nodes: DemoNode[]
  probeEdges: DemoEdge[]
  rejectedEdges: DemoEdge[]
  finalEdges: DemoEdge[]
}

const TOTAL_DURATION = 10
const cityIconByName: Record<string, string> = {
  郑州: '河南博物院',
  洛阳: '龙门石窟',
  开封: '清明上河园',
  安阳: '殷墟',
  焦作: '云台山',
  南阳: '卧龙岗武侯祠',
}

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

function toEdge(id: string, from: string, to: string, start: number, end: number): DemoEdge {
  return { id, from, to, start, end }
}

export function buildSpotDemoScene(routeSpotNames: string[], spots: Spot[]): DemoScene {
  const routeSet = new Set(routeSpotNames)
  const finalLayout = new Map(buildRecommendLayout(routeSpotNames).nodes.map((node) => [node.name, node]))
  const nodes = spots.map((spot, index) => {
    const scatter = toScatterPoint(spot.name, index)
    const finalNode = finalLayout.get(spot.name)
    const active = routeSet.has(spot.name)
    const routeIndex = routeSpotNames.indexOf(spot.name)
    return {
      id: spot.name,
      label: spot.name,
      x: finalNode?.x ?? scatter.x,
      y: finalNode?.y ?? scatter.y,
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

  const ambientNames = nodes.filter((node) => !node.active).map((node) => node.id)
  const probeEdges: DemoEdge[] = []
  const rejectedEdges: DemoEdge[] = []
  const finalEdges: DemoEdge[] = routeSpotNames.slice(0, -1).map((from, index) =>
    toEdge(`final-${from}-${routeSpotNames[index + 1]}`, from, routeSpotNames[index + 1] ?? '', 6.4 + index * 0.7, 10),
  )

  routeSpotNames.forEach((from, index) => {
    const decoyA = ambientNames[index % Math.max(ambientNames.length, 1)]
    const decoyB = ambientNames[(index + 3) % Math.max(ambientNames.length, 1)]
    const next = routeSpotNames[index + 1]
    const start = 1.4 + index * 1.1
    if (decoyA) {
      const edge = toEdge(`probe-${from}-${decoyA}-${index}`, from, decoyA, start, start + 1.7)
      probeEdges.push(edge)
      rejectedEdges.push(edge)
    }
    if (decoyB && decoyB !== decoyA) {
      const edge = toEdge(`probe-${from}-${decoyB}-${index}`, from, decoyB, start + 0.35, start + 1.95)
      probeEdges.push(edge)
      rejectedEdges.push(edge)
    }
    if (next) {
      probeEdges.push(toEdge(`probe-final-${from}-${next}`, from, next, start + 0.2, 6.8 + index * 0.7))
    }
  })

  return {
    totalDuration: TOTAL_DURATION,
    nodes,
    probeEdges,
    rejectedEdges,
    finalEdges,
  }
}

export function buildCityDemoScene(routeCityPath: string[]): DemoScene {
  const orderedCities = Object.entries(cityPoints).map(([name, point], index) => {
    const scatter = toScatterPoint(name, index)
    return {
      id: name,
      label: name,
      x: point.x,
      y: point.y,
      scatterX: scatter.x,
      scatterY: scatter.y,
      iconName: cityIconByName[name] ?? '河南博物院',
      active: routeCityPath.includes(name),
      role:
        name === routeCityPath[0]
          ? 'start'
          : name === routeCityPath[routeCityPath.length - 1]
            ? 'end'
            : routeCityPath.includes(name)
              ? 'pass'
              : 'ambient',
    } satisfies DemoNode
  })

  const allCities = orderedCities.map((node) => node.id)
  const probeEdges: DemoEdge[] = []
  const rejectedEdges: DemoEdge[] = []
  const finalEdges: DemoEdge[] = routeCityPath.slice(0, -1).map((from, index) =>
    toEdge(`city-final-${from}-${routeCityPath[index + 1]}`, from, routeCityPath[index + 1] ?? '', 6.2 + index * 0.8, 10),
  )

  routeCityPath.forEach((from, index) => {
    const decoy = allCities[(index + 2) % allCities.length]
    const next = routeCityPath[index + 1]
    const start = 1.8 + index * 1.15
    if (decoy && decoy !== next && decoy !== from) {
      const edge = toEdge(`city-probe-${from}-${decoy}-${index}`, from, decoy, start, start + 1.9)
      probeEdges.push(edge)
      rejectedEdges.push(edge)
    }
    if (next) {
      probeEdges.push(toEdge(`city-probe-final-${from}-${next}`, from, next, start + 0.3, 6.6 + index * 0.8))
    }
  })

  return {
    totalDuration: TOTAL_DURATION,
    nodes: orderedCities,
    probeEdges,
    rejectedEdges,
    finalEdges,
  }
}
