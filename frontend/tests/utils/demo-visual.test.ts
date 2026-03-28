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

    expect(scene.totalDuration).toBe(24)
    expect(scene.nodes).toHaveLength(spots.length)
    expect(scene.nodes.filter((node) => node.active)).toHaveLength(2)
    expect(scene.probeEdges.length).toBeGreaterThan(0)
    expect(scene.probeEdges.length).toBeGreaterThanOrEqual(scene.finalEdges.length)
    expect(scene.finalEdges).toHaveLength(1)
    expect(scene.probeEdges.every((edge) => edge.label.length > 0)).toBe(true)
    expect(scene.finalEdges.every((edge) => edge.label.endsWith('km'))).toBe(true)
    expect(scene.probeEdges.every((edge) => edge.label !== '0 km')).toBe(true)
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

  it('keeps a visible probe phase before the chosen final segment is allowed to appear', () => {
    const routeSpotNames = pickRouteSpotsByUniqueCities(2)
    const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')
    const chosenEdge = scene.finalEdges[0]
    const relatedProbe = scene.probeEdges.find((edge) => edge.from === chosenEdge?.from && edge.to === chosenEdge?.to)

    expect(chosenEdge).toBeDefined()
    expect(relatedProbe).toBeDefined()
    expect((chosenEdge?.start ?? 0) - (relatedProbe?.end ?? 0)).toBeGreaterThanOrEqual(2)
  })

  it('waits for all candidate probes in a round to finish before showing the chosen final segment', () => {
    const scene = buildSpotDemoScene(['河南博物院', '殷墟', '清明上河园'], spots, 'distance')
    const firstRoundProbes = scene.probeEdges.filter((edge) => edge.from === '河南博物院')
    const firstRoundFinal = scene.finalEdges.find((edge) => edge.from === '河南博物院')
    const latestProbeEnd = Math.max(...firstRoundProbes.map((edge) => edge.end))

    expect(firstRoundProbes.length).toBe(1)
    expect(firstRoundFinal).toBeDefined()
    expect((firstRoundFinal?.start ?? 0)).toBeGreaterThan(latestProbeEnd)
  })

  it('chooses the minimum-weight candidate among the actually eligible nodes in that round', () => {
    const scene = buildSpotDemoScene(['河南博物院', '殷墟', '云台山', '清明上河园'], spots, 'distance')
    const firstRoundProbes = scene.probeEdges.filter((edge) => edge.from === '河南博物院')
    const firstRoundFinal = scene.finalEdges.find((edge) => edge.from === '河南博物院')
    const probeLabels = firstRoundProbes.map((edge) => Number(edge.label.replace(' km', '')))

    expect(firstRoundProbes.map((edge) => edge.to)).toEqual(['云台山', '殷墟'])
    expect(firstRoundFinal?.to).toBe('云台山')
    expect(Number(firstRoundFinal?.label.replace(' km', '') ?? 0)).toBe(Math.min(...probeLabels))
  })

  it('chooses 铁塔公园 from 白马寺 when it has the smallest eligible path distance in that round', () => {
    const scene = buildSpotDemoScene(['白马寺', '铁塔公园', '殷墟', '清明上河园'], spots, 'distance')
    const firstRoundProbes = scene.probeEdges.filter((edge) => edge.from === '白马寺')
    const firstRoundFinal = scene.finalEdges.find((edge) => edge.from === '白马寺')
    const probeLabels = firstRoundProbes.map((edge) => Number(edge.label.replace(' km', '')))

    expect(firstRoundProbes.map((edge) => edge.to)).toEqual(['铁塔公园', '殷墟'])
    expect(firstRoundFinal?.to).toBe('铁塔公园')
    expect(Number(firstRoundFinal?.label.replace(' km', '') ?? 0)).toBe(Math.min(...probeLabels))
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
    expect(Math.min(...distances)).toBeGreaterThan(6)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(52)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(34)
    expect(activeNodes.every((node) => node.x >= 10 && node.x <= 90)).toBe(true)
    expect(activeNodes.every((node) => node.y >= 10 && node.y <= 90)).toBe(true)
  })

  it('keeps all scenic anchors reasonably separated to avoid overlapping icons', () => {
    const scene = buildSpotDemoScene(pickRouteSpotsByUniqueCities(4), spots, 'distance')
    const distances = scene.nodes.flatMap((node, index) =>
      scene.nodes.slice(index + 1).map((other) => Math.hypot(node.x - other.x, node.y - other.y)),
    )

    expect(Math.min(...distances)).toBeGreaterThan(3.6)
  })

  it('spreads scenic anchors across the canvas instead of clustering them into a few tight areas', () => {
    const scene = buildSpotDemoScene(pickRouteSpotsByUniqueCities(4), spots, 'distance')
    const columns = new Set(scene.nodes.map((node) => Math.floor(node.x / 20)))
    const rows = new Set(scene.nodes.map((node) => Math.floor(node.y / 20)))
    const xs = scene.nodes.map((node) => node.x)
    const ys = scene.nodes.map((node) => node.y)

    expect(columns.size).toBeGreaterThanOrEqual(5)
    expect(rows.size).toBeGreaterThanOrEqual(4)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(66)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(60)
  })

  it('keeps scenic anchors close to a disciplined grid so the layout reads as regular', () => {
    const scene = buildSpotDemoScene(pickRouteSpotsByUniqueCities(4), spots, 'distance')
    const count = scene.nodes.length
    const columns = Math.max(4, Math.ceil(Math.sqrt(count * 1.45)))
    const rows = Math.max(3, Math.ceil(count / columns))
    const usableWidth = 92 - 8
    const usableHeight = 92 - 6
    const cellWidth = usableWidth / columns
    const cellHeight = usableHeight / rows

    const maxOffset = Math.max(
      ...scene.nodes.map((node) => {
        const col = Math.min(columns - 1, Math.max(0, Math.round((node.x - 8) / cellWidth - 0.5)))
        const row = Math.min(rows - 1, Math.max(0, Math.round((node.y - 6) / cellHeight - 0.5)))
        const centerX = 8 + cellWidth * (col + 0.5)
        const centerY = 6 + cellHeight * (row + 0.5)
        return Math.hypot(node.x - centerX, node.y - centerY)
      }),
    )

    expect(maxOffset).toBeLessThanOrEqual(0.75)
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

  it('chooses the nearest remaining required node at each step instead of following the original selection order', () => {
    const selectedSpotNames = ['河南博物院', '殷墟', '云台山', '清明上河园']
    const scene = buildSpotDemoScene(selectedSpotNames, spots, 'distance')
    const finalPath = scene.finalEdges.map((edge) => `${edge.from}->${edge.to}`)

    expect(finalPath).toEqual([
      '河南博物院->云台山',
      '云台山->殷墟',
      '殷墟->清明上河园',
    ])
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

    expect(scene.totalDuration).toBe(24)
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

  it('lays out active city nodes along a readable left-to-right backbone', () => {
    const cities = ['安阳', '郑州', '焦作', '洛阳', '南阳', '开封']
    const scene = buildCityDemoScene(cities, 'distance')
    const activeNodes = cities
      .map((city) => scene.nodes.find((node) => node.id === city))
      .filter((node): node is NonNullable<typeof node> => Boolean(node))

    expect(activeNodes).toHaveLength(cities.length)

    for (let index = 0; index < activeNodes.length - 1; index += 1) {
      expect((activeNodes[index + 1]?.x ?? 0) > (activeNodes[index]?.x ?? 0)).toBe(true)
    }

    const ys = activeNodes.map((node) => node.y)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(18)
  })

  it('keeps ambient city nodes off the main backbone band so the route stays readable', () => {
    const cities = ['安阳', '郑州', '焦作', '洛阳', '南阳', '开封']
    const scene = buildCityDemoScene(cities, 'distance')
    const ambientNodes = scene.nodes.filter((node) => !cities.includes(node.id))

    expect(ambientNodes.length).toBeGreaterThan(0)
    expect(ambientNodes.every((node) => node.y <= 16 || node.y >= 84)).toBe(true)
  })
})
