<template>
  <section class="page">
    <TopNav />

    <header class="page-header">
      <h2>路径详情</h2>
    </header>

    <section v-if="plan" class="route-layout">
      <div class="route-map-card">
        <h3>城市最短路径图</h3>
        <div class="route-meta">景点顺序：{{ plan.routeSpotNames.join(' → ') }}</div>
        <div class="route-meta">城市路径：{{ plan.routeCityPath.join(' → ') }}</div>
        <div class="route-map" :style="{ backgroundImage: `url(${mapBg})` }">
          <svg class="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              v-for="edge in graphEdges"
              :key="`base-${edge.key}`"
              :d="edge.path"
              class="graph-edge-base"
              pathLength="100"
            />
            <path
              v-for="edge in animatedLegs"
              :key="`active-${plan.confirmedAt}-${edge.key}`"
              :d="edge.path"
              class="graph-edge-active"
              pathLength="100"
              :style="{
                '--route-duration': `${edge.duration}s`,
                '--route-delay': `${edge.delay}s`,
              }"
            />
          </svg>

          <div
            v-for="city in citiesOnMap"
            :key="city.name"
            class="city-node"
            :class="{ active: city.active }"
            :style="{ left: `${city.x}%`, top: `${city.y}%` }"
          >
            {{ city.name }}
          </div>
        </div>
      </div>

      <aside class="segment-card">
        <h3>最短路径分段明细</h3>
        <table>
          <thead>
            <tr>
              <th>区间</th>
              <th>距离</th>
              <th>时长</th>
              <th>费用</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in plan.legs" :key="`${row.from}-${row.to}-${idx}`">
              <td>{{ row.from }}→{{ row.to }}</td>
              <td>{{ row.distance }}km</td>
              <td>{{ row.time.toFixed(1) }}h</td>
              <td>¥{{ row.cost }}</td>
            </tr>
          </tbody>
        </table>
        <p class="sum">
          合计 {{ plan.routeSpotNames.length }} 景点 {{ plan.totalDistance }}km {{ plan.totalTime.toFixed(1) }}h ¥{{ plan.totalCost }}
        </p>
      </aside>
    </section>

    <section v-else class="section-card">
      <h3>暂无已确认路线</h3>
      <p>请先在“智能推荐”页选择起终点并确认链路。</p>
      <RouterLink to="/recommend" class="primary" style="display:inline-block;text-decoration:none;">去智能推荐</RouterLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopNav from '../components/TopNav.vue'
import { cityEdges } from '../data/graph'
import { plannerState } from '../state/planner'
import { buildAnimatedLegs, cityPoints, getPathBetweenCities } from '../utils/route-visual'

const mapBg = '/images/route-map-bg.jpg'
const plan = computed(() => plannerState.currentPlan)

const graphEdges = computed(() =>
  cityEdges.map((edge, idx) => ({
    key: `${edge.from}-${edge.to}-${idx}`,
    path: getPathBetweenCities(edge.from, edge.to),
  })),
)

const animatedLegs = computed(() => (plan.value ? buildAnimatedLegs(plan.value.legs) : []))

const citiesOnMap = computed(() => {
  const activeCities = new Set(plan.value?.routeCityPath ?? [])
  return Object.entries(cityPoints).map(([name, point]) => ({
    name,
    x: point.x,
    y: point.y,
    active: activeCities.has(name),
  }))
})
</script>

