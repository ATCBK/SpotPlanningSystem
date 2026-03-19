export type Spot = {
  name: string
  city: string
  topic: '历史古迹' | '山水风景' | '博物馆'
  score: number
  time: string
  price: string
  meta: string
  img: string
}

export type SpotTopicFilter = Spot['topic'] | '全部'

export const spots: Spot[] = [
  {
    name: '河南博物院',
    city: '郑州',
    topic: '博物馆',
    score: 4.8,
    time: '2h',
    price: '¥0',
    meta: '郑州 · 文博',
    img: '/images/spots/henan-museum.png',
  },
  {
    name: '少林寺',
    city: '郑州',
    topic: '历史古迹',
    score: 4.8,
    time: '3h',
    price: '¥80',
    meta: '登封 · 禅武',
    img: '/images/spots/shaolin-temple.png',
  },
  {
    name: '嵩阳书院',
    city: '郑州',
    topic: '历史古迹',
    score: 4.6,
    time: '1.5h',
    price: '¥30',
    meta: '郑州 · 古迹',
    img: '/images/spots/songyang-academy.png',
  },
  {
    name: '龙门石窟',
    city: '洛阳',
    topic: '历史古迹',
    score: 4.9,
    time: '2.5h',
    price: '¥90',
    meta: '洛阳 · 石刻',
    img: '/images/spots/longmen-grottoes.png',
  },
  {
    name: '白马寺',
    city: '洛阳',
    topic: '历史古迹',
    score: 4.7,
    time: '1.5h',
    price: '¥35',
    meta: '洛阳 · 佛寺',
    img: '/images/spots/white-horse-temple.png',
  },
  {
    name: '老君山',
    city: '洛阳',
    topic: '山水风景',
    score: 4.9,
    time: '4h',
    price: '¥100',
    meta: '洛阳 · 山水',
    img: '/images/spots/laojun-mountain.png',
  },
  {
    name: '清明上河园',
    city: '开封',
    topic: '历史古迹',
    score: 4.7,
    time: '2h',
    price: '¥120',
    meta: '开封 · 宋韵',
    img: '/images/spots/qingming-garden.png',
  },
  {
    name: '包公祠',
    city: '开封',
    topic: '历史古迹',
    score: 4.6,
    time: '1h',
    price: '¥20',
    meta: '开封 · 名祠',
    img: '/images/spots/baogong-temple.png',
  },
  {
    name: '殷墟',
    city: '安阳',
    topic: '历史古迹',
    score: 4.7,
    time: '2h',
    price: '¥70',
    meta: '安阳 · 遗址',
    img: '/images/spots/yinxu.png',
  },
  {
    name: '红旗渠',
    city: '安阳',
    topic: '山水风景',
    score: 4.9,
    time: '2.5h',
    price: '¥60',
    meta: '安阳 · 山水',
    img: '/images/spots/hongqi-canal.png',
  },
  {
    name: '云台山',
    city: '焦作',
    topic: '山水风景',
    score: 4.8,
    time: '3h',
    price: '¥120',
    meta: '焦作 · 山水',
    img: '/images/spots/yuntai-mountain.png',
  },
  {
    name: '医圣祠',
    city: '南阳',
    topic: '博物馆',
    score: 4.5,
    time: '1.5h',
    price: '¥35',
    meta: '南阳 · 医史',
    img: '/images/spots/yisheng-temple.png',
  },
  {
    name: '二七纪念塔',
    city: '郑州',
    topic: '历史古迹',
    score: 4.6,
    time: '1h',
    price: '¥0',
    meta: '郑州 · 城市地标',
    img: '/images/spots/erqi-tower.png',
  },
  {
    name: '洛阳博物馆',
    city: '洛阳',
    topic: '博物馆',
    score: 4.7,
    time: '2h',
    price: '¥0',
    meta: '洛阳 · 文博',
    img: '/images/spots/luoyang-museum.png',
  },
  {
    name: '铁塔公园',
    city: '开封',
    topic: '历史古迹',
    score: 4.6,
    time: '1.5h',
    price: '¥40',
    meta: '开封 · 古塔',
    img: '/images/spots/iron-pagoda-park.png',
  },
  {
    name: '卧龙岗武侯祠',
    city: '南阳',
    topic: '历史古迹',
    score: 4.7,
    time: '1.5h',
    price: '¥35',
    meta: '南阳 · 三国文化',
    img: '/images/spots/wolonggang-wuhou-temple.png',
  },
]

export function filterSpots(items: Spot[], city: string, topic: SpotTopicFilter) {
  return items.filter(
    (spot) => (city === '全部' || spot.city === city) && (topic === '全部' || spot.topic === topic),
  )
}

export const spotByName = new Map(spots.map((spot) => [spot.name, spot]))
