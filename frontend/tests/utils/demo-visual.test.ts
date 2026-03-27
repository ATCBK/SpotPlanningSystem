import { describe, expect, it } from 'vitest'
import { spotIconRegistry } from '../../src/data/spot-icons'
import { spots } from '../../src/data/spots'
import { buildCityDemoScene, buildSpotDemoScene } from '../../src/utils/demo-visual'
import { cityPoints } from '../../src/utils/route-visual'

function pickRouteSpotsByUniqueCities(count: number) {
  const selected: string[] = []
  const seenCities = new Set<string>()

  for (const spot of spots) {
    if (seenCities.has(spot.city)) {
      continue
    }
    seenCities.add(spot.city)
    selected.push(spot.name)
    if (selected.length === count) {
      break
    }
  }

  return selected
}

describe('spotIconRegistry', () => {
  it('covers every scenic spot with a dedicated icon definition', () => {
    expect(spots.every((spot) => spotIconRegistry[spot.name])).toBe(true)
  })
})

describe('buildSpotDemoScene', () => {
  it('creates a scenic-spot demo that emphasizes A* search expansion, not just direct final links', () => {
    const routeSpotNames = pickRouteSpotsByUniqueCities(2)
    const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')

    expect(scene.totalDuration).toBe(16)
    expect(scene.nodes).toHaveLength(spots.length)
    expect(scene.nodes.filter((node) => node.active)).toHaveLength(2)
    expect(scene.probeEdges.length).toBeGreaterThan(0)
    expect(scene.probeEdges.length).toBeGreaterThanOrEqual(scene.finalEdges.length)
    expect(scene.finalEdges).toHaveLength(1)
    expect(scene.probeEdges.every((edge) => edge.label.length > 0)).toBe(true)
    expect(scene.finalEdges.every((edge) => edge.label.endsWith('km'))).toBe(true)
  })

  it('emits sequential probe events without overlapping candidate comparisons', () => {
    const routeSpotNames = pickRouteSpotsByUniqueCities(4)
    const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')
    const probeEvents = scene.events.filter((event) => event.type === 'probe-edge')

    for (let index = 0; index < probeEvents.length - 1; index += 1) {
      const current = probeEvents[index]
      const next = probeEvents[index + 1]
      expect((current?.end ?? 0) <= (next?.start ?? 0)).toBe(true)
    }
  })

  it('keeps active scenic nodes on unique final positions', () => {
    const routeSpotNames = pickRouteSpotsByUniqueCities(5)
    const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')
    const activeNodes = scene.nodes.filter((node) => node.active)
    const distances = activeNodes.flatMap((node, index) =>
      activeNodes.slice(index + 1).map((other) => Math.hypot(node.x - other.x, node.y - other.y)),
    )
    const xs = activeNodes.map((node) => node.x)
    const ys = activeNodes.map((node) => node.y)

    expect(new Set(activeNodes.map((node) => `${node.x}-${node.y}`)).size).toBe(activeNodes.length)
    expect(Math.min(...distances)).toBeGreaterThan(4)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(52)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(34)
    expect(activeNodes.every((node) => node.x >= 10 && node.x <= 90)).toBe(true)
    expect(activeNodes.every((node) => node.y >= 10 && node.y <= 90)).toBe(true)
  })

  it('creates focus and settle events for each selected scenic spot segment', () => {
    const routeSpotNames = pickRouteSpotsByUniqueCities(4)
    const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')
    const focusNodeIds = scene.events.filter((event) => event.type === 'focus-node').map((event) => event.nodeId)
    const settleNodeIds = scene.events.filter((event) => event.type === 'settle-node').map((event) => event.nodeId)

    expect(focusNodeIds.length).toBeGreaterThan(0)
    expect(settleNodeIds.length).toBeGreaterThan(0)
    expect(focusNodeIds.includes(routeSpotNames[0] ?? '')).toBe(true)
    expect(settleNodeIds.includes(routeSpotNames[routeSpotNames.length - 1] ?? '')).toBe(true)
    expect(scene.finalEdges.length).toBeGreaterThan(0)
  })

  it('lights up intermediate candidate scenic nodes during the search even with only a start and end selection', () => {
    const routeSpotNames = pickRouteSpotsByUniqueCities(2)
    const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')
    const touchedNodeIds = new Set(
      scene.events
        .filter((event) => event.type === 'focus-node' || event.type === 'probe-edge' || event.type === 'settle-node')
        .map((event) => event.nodeId)
        .filter((nodeId): nodeId is string => Boolean(nodeId)),
    )

    expect(touchedNodeIds.has(routeSpotNames[0] ?? '')).toBe(true)
    expect(touchedNodeIds.has(routeSpotNames[1] ?? '')).toBe(true)
    expect(touchedNodeIds.size).toBeGreaterThanOrEqual(2)
  })
})

describe('buildCityDemoScene', () => {
  it('creates a city-level comparison scene with strategy-aware labels', () => {
    const cities = Object.keys(cityPoints).slice(0, 4)
    const scene = buildCityDemoScene(cities, 'cost')

    expect(scene.totalDuration).toBe(16)
    expect(scene.nodes.some((node) => node.active)).toBe(true)
    expect(scene.finalEdges).toHaveLength(3)
    expect(scene.probeEdges.length).toBeGreaterThan(0)
    expect(scene.finalEdges.every((edge) => edge.label.startsWith('¥'))).toBe(true)
    expect(scene.rejectedEdges.some((edge) => edge.label.startsWith('¥'))).toBe(true)
  })

  it('emits ordered phase events for focus, probe, reject, choose, and settle actions', () => {
    const cities = Object.keys(cityPoints).slice(0, 4)
    const scene = buildCityDemoScene(cities, 'distance')

    expect(scene.events.some((event) => event.type === 'focus-node')).toBe(true)
    expect(scene.events.some((event) => event.type === 'probe-edge')).toBe(true)
    expect(scene.events.some((event) => event.type === 'reject-edge')).toBe(true)
    expect(scene.events.some((event) => event.type === 'choose-edge')).toBe(true)
    expect(scene.events.some((event) => event.type === 'settle-node')).toBe(true)

    const probeEvent = scene.events.find((event) => event.type === 'probe-edge')
    const chooseEvent = scene.events.find((event) => event.type === 'choose-edge')
    const settleEvent = scene.events.find((event) => event.type === 'settle-node')

    expect(probeEvent).toBeDefined()
    expect(chooseEvent).toBeDefined()
    expect(settleEvent).toBeDefined()
    expect((probeEvent?.start ?? 0) < (chooseEvent?.start ?? 0)).toBe(true)
    expect((chooseEvent?.start ?? 0) <= (settleEvent?.start ?? 0)).toBe(true)
    expect((chooseEvent?.start ?? 0) - (probeEvent?.start ?? 0)).toBeGreaterThan(0.8)
  })
})
