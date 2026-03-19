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
import { filterSpots, type Spot, type SpotTopicFilter, spots as allSpots } from '../data/spots'
import { plannerState, setSelectedSpots, toggleSelectedSpot } from '../state/planner'

const sidebarBg =
  'https://images.unsplash.com/photo-1726293534700-c20711c29fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1MjF8&ixlib=rb-4.1.0&q=80&w=1080'
const cities = ['全部', '郑州', '洛阳', '开封', '安阳', '焦作', '南阳']
const topics: SpotTopicFilter[] = ['全部', '历史古迹', '山水风景', '博物馆']

const activeCity = ref('全部')
const activeTopic = ref<SpotTopicFilter>('全部')
const selectedSet = computed(() => new Set(plannerState.selectedSpotNames))

const filteredSpots = computed(() => filterSpots(allSpots, activeCity.value, activeTopic.value))

const displaySpots = computed<Spot[]>(() => filteredSpots.value)

function toggleSpot(name: string) {
  toggleSelectedSpot(name)
  setSelectedSpots(plannerState.selectedSpotNames)
}
</script>
