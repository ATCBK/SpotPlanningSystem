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

export const spots: Spot[] = [
  {
    name: '河南博物院',
    city: '郑州',
    topic: '博物馆',
    score: 4.8,
    time: '2h',
    price: '¥0',
    meta: '郑州 · 文博',
    img: '/images/generated-1772603505554.png',
  },
  {
    name: '少林寺',
    city: '郑州',
    topic: '历史古迹',
    score: 4.8,
    time: '3h',
    price: '¥80',
    meta: '登封 · 禅武',
    img: '/images/generated-1772603511344.png',
  },
  {
    name: '嵩阳书院',
    city: '郑州',
    topic: '历史古迹',
    score: 4.6,
    time: '1.5h',
    price: '¥30',
    meta: '郑州 · 古迹',
    img: 'https://images.unsplash.com/photo-1710926766648-f11bc333418f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: '龙门石窟',
    city: '洛阳',
    topic: '历史古迹',
    score: 4.9,
    time: '2.5h',
    price: '¥90',
    meta: '洛阳 · 石刻',
    img: '/images/generated-1772603492567.png',
  },
  {
    name: '白马寺',
    city: '洛阳',
    topic: '历史古迹',
    score: 4.7,
    time: '1.5h',
    price: '¥35',
    meta: '洛阳 · 佛寺',
    img: '/images/generated-1772603759149.png',
  },
  {
    name: '老君山',
    city: '洛阳',
    topic: '山水风景',
    score: 4.9,
    time: '4h',
    price: '¥100',
    meta: '洛阳 · 山水',
    img: 'https://images.unsplash.com/photo-1761118270908-df3580048785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: '清明上河园',
    city: '开封',
    topic: '历史古迹',
    score: 4.7,
    time: '2h',
    price: '¥120',
    meta: '开封 · 宋韵',
    img: '/images/generated-1772603499876.png',
  },
  {
    name: '包公祠',
    city: '开封',
    topic: '历史古迹',
    score: 4.6,
    time: '1h',
    price: '¥20',
    meta: '开封 · 名祠',
    img: '/images/generated-1772603860746.png',
  },
  {
    name: '殷墟',
    city: '安阳',
    topic: '历史古迹',
    score: 4.7,
    time: '2h',
    price: '¥70',
    meta: '安阳 · 遗址',
    img: '/images/generated-1772603764558.png',
  },
  {
    name: '红旗渠',
    city: '安阳',
    topic: '山水风景',
    score: 4.9,
    time: '2.5h',
    price: '¥60',
    meta: '安阳 · 山水',
    img: 'https://images.unsplash.com/photo-1690956895349-b1676ac695ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODl8&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: '云台山',
    city: '焦作',
    topic: '山水风景',
    score: 4.8,
    time: '3h',
    price: '¥120',
    meta: '焦作 · 山水',
    img: 'https://images.unsplash.com/photo-1718158234699-5b41bba0518e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODh8&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: '医圣祠',
    city: '南阳',
    topic: '博物馆',
    score: 4.5,
    time: '1.5h',
    price: '¥35',
    meta: '南阳 · 医史',
    img: '/images/generated-1772603928894.png',
  },
]

export const spotByName = new Map(spots.map((spot) => [spot.name, spot]))
