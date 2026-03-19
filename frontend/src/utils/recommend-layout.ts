export type RecommendNode = {
  name: string
  x: number
  y: number
}

export type RecommendSegment = {
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
  delay: number
}

function interpolate(min: number, max: number, index: number, count: number) {
  if (count <= 1) {
    return (min + max) / 2
  }
  return min + ((max - min) * index) / (count - 1)
}

export function buildRecommendLayout(names: string[]) {
  const cleanNames = [...new Set(names.filter(Boolean))]
  if (cleanNames.length === 0) {
    return { nodes: [] as RecommendNode[], segments: [] as RecommendSegment[] }
  }

  const columns = cleanNames.length >= 7 ? 3 : cleanNames.length <= 4 ? cleanNames.length : 4
  const rows = Math.ceil(cleanNames.length / columns)

  const nodes = cleanNames.map((name, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns
    const rowStart = row * columns
    const rowCount = Math.min(columns, cleanNames.length - rowStart)
    const visualColumn = row % 2 === 1 ? rowCount - column : column + 1
    const x = interpolate(16, 84, visualColumn, rowCount + 1)
    const y = interpolate(28, 76, row + 1, rows + 1)

    return {
      name,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    }
  })

  const segments = nodes.slice(0, -1).map((node, index) => ({
    key: `${node.name}-${nodes[index + 1]?.name ?? index}`,
    x1: node.x,
    y1: node.y,
    x2: nodes[index + 1]?.x ?? node.x,
    y2: nodes[index + 1]?.y ?? node.y,
    delay: index * 0.18,
  }))

  return { nodes, segments }
}
