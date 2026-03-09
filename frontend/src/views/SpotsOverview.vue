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
        <article v-for="spot in displaySpots" :key="spot.name" class="spot-card">
          <img :src="spot.img" :alt="spot.name" />
          <div class="spot-info">
            <strong>{{ spot.name }} · {{ spot.score }}★</strong>
            <small>{{ spot.city }} | 建议停留 {{ spot.time }} | 门票 {{ spot.price }}</small>
            <button :class="{ added: selectedSet.has(spot.name) }" @click="toggleSpot(spot.name)">
              {{ selectedSet.has(spot.name) ? '已加入' : '加入行程' }}
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
import { type Spot, spots as allSpots } from '../data/spots'
import { plannerState, setSelectedSpots, toggleSelectedSpot } from '../state/planner'

const sidebarBg =
  'https://images.unsplash.com/photo-1726293534700-c20711c29fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1MjF8&ixlib=rb-4.1.0&q=80&w=1080'
const cities = ['全部', '郑州', '洛阳', '开封', '安阳', '焦作', '南阳']
const topics = ['历史古迹', '山水风景', '博物馆']

const activeCity = ref('全部')
const activeTopic = ref('历史古迹')
const selectedSet = computed(() => new Set(plannerState.selectedSpotNames))

// Strict image-to-spot mapping from approved UI.
const strictSpotImageMap: Partial<Record<string, string>> = {
  少林寺: '/images/generated-1772603511344.png',
  嵩阳书院:
    'https://images.unsplash.com/photo-1710926766648-f11bc333418f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080',
  龙门石窟: '/images/generated-1772603492567.png',
  白马寺: '/images/generated-1772603759149.png',
  清明上河园: '/images/generated-1772603499876.png',
  包公祠: '/images/generated-1772603860746.png',
  殷墟: '/images/generated-1772603764558.png',
}

const strictSpotOrder = new Map(
  ['少林寺', '嵩阳书院', '龙门石窟', '白马寺', '清明上河园', '包公祠', '殷墟'].map((name, index) => [name, index]),
)

const filteredSpots = computed(() =>
  allSpots.filter((s) => (activeCity.value === '全部' || s.city === activeCity.value) && s.topic === activeTopic.value),
)

const displaySpots = computed<Spot[]>(() =>
  filteredSpots.value
    .map((spot) => ({ ...spot, img: strictSpotImageMap[spot.name] ?? spot.img }))
    .sort((a, b) => (strictSpotOrder.get(a.name) ?? Number.MAX_SAFE_INTEGER) - (strictSpotOrder.get(b.name) ?? Number.MAX_SAFE_INTEGER)),
)

function toggleSpot(name: string) {
  toggleSelectedSpot(name)
  setSelectedSpots(plannerState.selectedSpotNames)
}
</script>
