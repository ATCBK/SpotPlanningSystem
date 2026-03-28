import type { RouteLeg } from './dijkstra'

export type Point = { x: number; y: number }

export const cityPoints: Record<string, Point> = {
  郑州: { x: 40, y: 48 },
  洛阳: { x: 26, y: 56 },
  开封: { x: 57, y: 47 },
  安阳: { x: 48, y: 33 },
  焦作: { x: 35, y: 38 },
  南阳: { x: 28, y: 74 },
  信阳: { x: 49, y: 86 },
}

export type AnimatedLeg = {
  key: string
  from: string
  to: string
  path: string
  distance: number
  duration: number
  delay: number
}

export function getPathBetweenCities(from: string, to: string): string {
  const a = cityPoints[from]
  const b = cityPoints[to]
  if (!a || !b) {
    return ''
  }
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
}

export function buildAnimatedLegs(legs: RouteLeg[]): AnimatedLeg[] {
  const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0)
  let elapsed = 0
  return legs.map((leg, index) => {
    const ratio = totalDistance > 0 ? leg.distance / totalDistance : 0
    const duration = Math.min(6, Math.max(1.2, Number((ratio * 10).toFixed(2))))
    const current = {
      key: `${leg.from}-${leg.to}-${index}`,
      from: leg.from,
      to: leg.to,
      path: getPathBetweenCities(leg.from, leg.to),
      distance: leg.distance,
      duration,
      delay: Number(elapsed.toFixed(2)),
    }
    elapsed += duration
    return current
  })
}
