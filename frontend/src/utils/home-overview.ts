import type { Spot } from '../data/spots'

type HomePosterStat = {
  label: string
  value: string
}

type HomeFeaturedCard = {
  name: string
  meta: string
  img: string
  scoreText: string
  detailText: string
  buttonLabel: string
}

type HomePoster = {
  eyebrow: string
  title: string
  tagline: string
  footer: string
  stats: HomePosterStat[]
}

export type HomeOverviewContent = {
  featuredCards: HomeFeaturedCard[]
  poster: HomePoster
}

const featuredSpotNames = ['龙门石窟', '少林寺', '清明上河园']
const featuredSpotCityLabel: Record<string, string> = {
  少林寺: '登封',
}

function getFeaturedSpot(spots: Spot[], name: string) {
  const spot = spots.find((item) => item.name === name)
  if (!spot) {
    throw new Error(`Missing featured spot: ${name}`)
  }
  return spot
}

export function buildHomeOverviewContent(spots: Spot[]): HomeOverviewContent {
  const cityCount = new Set(spots.map((spot) => spot.city)).size
  const topicCount = new Set(spots.map((spot) => spot.topic)).size

  const featuredCards = featuredSpotNames.map((name) => {
    const spot = getFeaturedSpot(spots, name)
    return {
      name: `${featuredSpotCityLabel[spot.name] ?? spot.city} · ${spot.name}`,
      meta: spot.meta,
      img: spot.img,
      scoreText: `${spot.score.toFixed(1)}★`,
      detailText: `建议停留 ${spot.time} | 门票 ${spot.price.replace('楼', '¥')}`,
      buttonLabel: '加入行程',
    }
  })

  return {
    featuredCards,
    poster: {
      eyebrow: '中原文旅海报',
      title: '河南文旅数据',
      tagline: '一屏串起古都、石窟、山水与博物馆，让首页先讲出河南的气质。',
      footer: '覆盖六座城市，适配景点总览、智能推荐与行程结果联动展示。',
      stats: [
        { label: '覆盖城市', value: String(cityCount) },
        { label: '精选景点', value: String(spots.length) },
        { label: '主题线路', value: String(topicCount) },
      ],
    },
  }
}
