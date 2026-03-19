import { describe, expect, it } from 'vitest'
import { spots } from '../../src/data/spots'
import { spotIconRegistry } from '../../src/data/spot-icons'
import { buildCityDemoScene, buildSpotDemoScene } from '../../src/utils/demo-visual'

describe('spotIconRegistry', () => {
  it('covers every scenic spot with a dedicated icon definition', () => {
    expect(spots.every((spot) => spotIconRegistry[spot.name])).toBe(true)
  })
})

describe('buildSpotDemoScene', () => {
  it('creates a 10-second scenic-spot demo with probe, rejected, and final edges', () => {
    const routeSpotNames = ['河南博物院', '少林寺', '龙门石窟', '清明上河园']
    const scene = buildSpotDemoScene(routeSpotNames, spots)

    expect(scene.totalDuration).toBe(10)
    expect(scene.nodes).toHaveLength(spots.length)
    expect(scene.nodes.filter((node) => node.active)).toHaveLength(4)
    expect(scene.probeEdges.length).toBeGreaterThan(0)
    expect(scene.rejectedEdges.length).toBeGreaterThan(0)
    expect(scene.finalEdges).toHaveLength(3)
  })
})

describe('buildCityDemoScene', () => {
  it('creates a city-level comparison scene for the route detail page', () => {
    const scene = buildCityDemoScene(['郑州', '焦作', '洛阳', '开封'])

    expect(scene.totalDuration).toBe(10)
    expect(scene.nodes.some((node) => node.active)).toBe(true)
    expect(scene.finalEdges).toHaveLength(3)
    expect(scene.probeEdges.length).toBeGreaterThan(0)
  })
})
