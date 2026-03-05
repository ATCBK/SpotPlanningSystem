<template>
  <section class="page">
    <TopNav />

    <header class="page-header">
      <h2>景点总览</h2>
      <p>按城市与主题筛选，探索河南人文与山水</p>
    </header>

    <section class="spot-layout">
      <aside class="filter-panel" :style="{ backgroundImage: `url(${sidebarBg})` }">
        <div class="filter-mask"></div>
        <h3>智能筛选</h3>
        <div class="chips">
          <span v-for="c in cities" :key="c" :class="['chip', c === activeCity ? 'active' : '']" @click="activeCity = c">
            {{ c }}
          </span>
        </div>
        <h4>主题偏好</h4>
        <ul>
          <li v-for="t in topics" :key="t" @click="activeTopic = t"> {{ activeTopic === t ? '●' : '○' }} {{ t }}</li>
        </ul>
      </aside>

      <div class="spot-grid">
        <article v-for="spot in filteredSpots" :key="spot.name" class="spot-card">
          <img :src="spot.img" :alt="spot.name" />
          <div class="spot-info">
            <strong>{{ spot.name }} · {{ spot.score }}★</strong>
            <small>{{ spot.city }} | 建议停留 {{ spot.time }} | 门票 {{ spot.price }}</small>
            <button :class="{ added: selected.has(spot.name) }" @click="toggleSpot(spot.name)">
              {{ selected.has(spot.name) ? '已加入' : '加入行程' }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TopNav from '../components/TopNav.vue'

type Spot = {
  name: string
  city: string
  topic: string
  score: number
  time: string
  price: string
  img: string
}

const sidebarBg =
  'https://images.unsplash.com/photo-1726293534700-c20711c29fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1MjF8&ixlib=rb-4.1.0&q=80&w=1080'
const cities = ['全部', '郑州', '洛阳', '开封', '安阳', '焦作', '南阳']
const topics = ['历史古迹', '山水风景', '博物馆']

const activeCity = ref('全部')
const activeTopic = ref('历史古迹')
const selected = ref(new Set<string>())

const spots: Spot[] = [
  { name: '龙门石窟', city: '洛阳', topic: '历史古迹', score: 4.9, time: '2.5h', price: '¥90', img: 'https://images.unsplash.com/photo-1664980329978-ba559c713693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI5MzZ8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '少林寺', city: '郑州', topic: '历史古迹', score: 4.8, time: '3h', price: '¥80', img: 'https://images.unsplash.com/photo-1584083221342-379999f859fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI5Mzd8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '清明上河园', city: '开封', topic: '历史古迹', score: 4.7, time: '2h', price: '¥120', img: 'https://images.unsplash.com/photo-1758383077073-7d33cfb66c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI5Mzh8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '云台山', city: '焦作', topic: '山水风景', score: 4.8, time: '3h', price: '¥120', img: 'https://images.unsplash.com/photo-1718158234699-5b41bba0518e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODh8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '殷墟', city: '安阳', topic: '历史古迹', score: 4.7, time: '2h', price: '¥70', img: 'https://images.unsplash.com/photo-1764697902732-9d8f476e174d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODh8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '红旗渠', city: '安阳', topic: '山水风景', score: 4.9, time: '2.5h', price: '¥60', img: 'https://images.unsplash.com/photo-1690956895349-b1676ac695ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODl8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '河南博物院', city: '郑州', topic: '博物馆', score: 4.8, time: '2h', price: '¥0', img: '/images/generated-1772603505554.png' },
  { name: '白马寺', city: '洛阳', topic: '历史古迹', score: 4.7, time: '1.5h', price: '¥35', img: '/images/generated-1772603759149.png' },
  { name: '包公祠', city: '开封', topic: '历史古迹', score: 4.6, time: '1h', price: '¥20', img: '/images/generated-1772603860746.png' },
  { name: '嵩阳书院', city: '郑州', topic: '历史古迹', score: 4.6, time: '1.5h', price: '¥30', img: 'https://images.unsplash.com/photo-1710926766648-f11bc333418f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '医圣祠', city: '南阳', topic: '博物馆', score: 4.5, time: '1.5h', price: '¥35', img: '/images/generated-1772603764558.png' },
  { name: '老君山', city: '洛阳', topic: '山水风景', score: 4.9, time: '4h', price: '¥100', img: 'https://images.unsplash.com/photo-1761118270908-df3580048785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080' },
]

const filteredSpots = computed(() =>
  spots.filter((s) => (activeCity.value === '全部' || s.city === activeCity.value) && s.topic === activeTopic.value),
)

function toggleSpot(name: string) {
  if (selected.value.has(name)) selected.value.delete(name)
  else selected.value.add(name)
  selected.value = new Set(selected.value)
}
</script>

