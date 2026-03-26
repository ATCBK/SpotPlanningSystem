<template>
  <section class="page">
    <TopNav />

    <header class="page-header">
      <h2>路径详情</h2>
    </header>

    <section v-if="plan" class="route-layout">
      <div class="route-map-card">
        <h3>城市{{ strategyLabel }}图</h3>
        <div class="route-meta">优化策略：{{ strategyLabel }}</div>
        <div class="route-meta">景点顺序：{{ plan.routeSpotNames.join(' → ') }}</div>
        <div class="route-meta">城市路径：{{ plan.routeCityPath.join(' → ') }}</div>
        <RouteDemoCanvas
          :scene="demoScene"
          :title="'试探比较 → 最短路径定格'"
          :background-image="mapBg"
        />
      </div>

      <aside class="segment-card">
        <h3>{{ strategyLabel }}分段明细</h3>
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
import RouteDemoCanvas from '../components/RouteDemoCanvas.vue'
import TopNav from '../components/TopNav.vue'
import { plannerState } from '../state/planner'
import { buildCityDemoScene } from '../utils/demo-visual'
import type { OptimizeBy } from '../utils/dijkstra'

const mapBg = '/images/route-map-bg.jpg'
const plan = computed(() => plannerState.currentPlan)
const strategyLabelMap: Record<OptimizeBy, string> = {
  distance: '最短路径',
  cost: '最低成本',
  composite: '综合排序',
}
const strategyLabel = computed(() => strategyLabelMap[plan.value?.optimizeBy ?? 'distance'])
const demoScene = computed(() => buildCityDemoScene(plan.value?.routeCityPath ?? [], plan.value?.optimizeBy ?? 'distance'))
</script>
