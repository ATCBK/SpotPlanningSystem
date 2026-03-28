export type CityEdge = {
  from: string
  to: string
  distance: number
  time: number
  cost: number
}

export const cityEdges: CityEdge[] = [
  { from: '郑州', to: '开封', distance: 78, time: 1.3, cost: 95 },
  { from: '郑州', to: '洛阳', distance: 128, time: 2.1, cost: 140 },
  { from: '郑州', to: '安阳', distance: 184, time: 2.8, cost: 190 },
  { from: '郑州', to: '焦作', distance: 93, time: 1.4, cost: 100 },
  { from: '郑州', to: '南阳', distance: 128, time: 2.0, cost: 130 },
  { from: '郑州', to: '信阳', distance: 226, time: 3.1, cost: 230 },
  { from: '洛阳', to: '开封', distance: 152, time: 2.6, cost: 210 },
  { from: '洛阳', to: '焦作', distance: 116, time: 1.8, cost: 125 },
  { from: '安阳', to: '开封', distance: 214, time: 3.0, cost: 240 },
  { from: '南阳', to: '洛阳', distance: 193, time: 2.9, cost: 210 },
  { from: '南阳', to: '信阳', distance: 182, time: 2.8, cost: 195 },
]
