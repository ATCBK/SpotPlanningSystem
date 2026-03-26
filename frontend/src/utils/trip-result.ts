export type TripSummaryItem = {
  label: string
  value: string
  note?: string
}

export function buildTripSummaryItems(input: {
  optimizeByLabel: string
  totalDistance: number
  totalTime: number
  totalCost: number
  spotCount: number
}): TripSummaryItem[] {
  return [
    {
      label: '优化策略',
      value: input.optimizeByLabel,
      note: `总时长 ${input.totalTime.toFixed(1)} h`,
    },
    {
      label: '覆盖景点',
      value: `${input.spotCount} 个`,
      note: '三日节奏拆分',
    },
    {
      label: '总里程',
      value: `${input.totalDistance} km`,
      note: '城市链路估算',
    },
    {
      label: '预计费用',
      value: `¥${input.totalCost}`,
      note: '交通与门票',
    },
  ]
}
