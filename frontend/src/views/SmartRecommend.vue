<template>
  <section class="page">
    <TopNav />
    <header class="page-header">
      <h2>智能推荐</h2>
    </header>

    <section class="recommend-layout">
      <aside class="select-panel">
        <h3>行程选择</h3>
        <p>三段式选择：先定起点，再定终点，最后补充必经点（自动去重）</p>

        <div class="steps">
          <span :class="{ done: mode === 'start' }" @click="mode = 'start'">① 始 出发景区</span>
          <span :class="{ active: mode === 'end' }" @click="mode = 'end'">② 终 结束景区</span>
          <span :class="{ done: mode === 'pass' }" @click="mode = 'pass'">③ 经 必经分支点</span>
        </div>
        <div class="strategy-switch">
          <button
            v-for="item in strategyOptions"
            :key="item.value"
            type="button"
            :class="['strategy-btn', { active: optimizeBy === item.value }]"
            @click="switchOptimizeBy(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="mini-grid">
          <article
            v-for="spot in spots"
            :key="spot.name"
            class="mini-card"
            :class="roleClass(spot.name)"
            @click="selectSpot(spot.name)"
          >
            <img :src="spot.img" :alt="spot.name" />
            <b>{{ spot.name }}</b>
            <small>{{ spot.meta }}</small>
            <em v-if="roleLabel(spot.name)">{{ roleLabel(spot.name) }}</em>
          </article>
        </div>
        <button class="primary" @click="confirmRoute">确认并更新链路</button>
      </aside>

      <section class="map-panel">
        <h3>景区链路图</h3>
        <p>当前依据：{{ routeText }}</p>
        <RouteDemoCanvas
          :scene="demoScene"
          :title="'散点试探 → 路径收敛'"
          :subtitle="`演示时长约 10 秒 · ${strategyLabel} · 候选景点 ${spots.length} 个`"
          :background-image="mapBg"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RouteDemoCanvas from '../components/RouteDemoCanvas.vue'
import TopNav from '../components/TopNav.vue'
import { spots as allSpots } from '../data/spots'
import { defaultOptimizeBy, defaultSpotNames, plannerState, syncCurrentPlanFromSelection } from '../state/planner'
import type { OptimizeBy } from '../utils/dijkstra'
import { buildSpotDemoScene } from '../utils/demo-visual'

type Mode = 'start' | 'end' | 'pass'

const mapBg =
  'https://images.unsplash.com/photo-1692892719022-f58c063924ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI2MDExMDl8&ixlib=rb-4.1.0&q=80&w=1080'

const spots = allSpots.map((spot) => ({ name: spot.name, meta: spot.meta, img: spot.img }))
const router = useRouter()
const preselected = plannerState.selectedSpotNames
const defaultStart = preselected[0] ?? defaultSpotNames.start
const defaultEnd = preselected[preselected.length - 1] ?? defaultSpotNames.end

const mode = ref<Mode>('start')
const start = ref(defaultStart)
const end = ref(defaultEnd === defaultStart ? defaultSpotNames.end : defaultEnd)
const pass = ref(preselected.slice(1, -1))
const optimizeBy = ref<OptimizeBy>(plannerState.currentPlan?.optimizeBy ?? defaultOptimizeBy)

const strategyOptions: Array<{ value: OptimizeBy; label: string }> = [
  { value: 'distance', label: '最短路径' },
  { value: 'cost', label: '最低成本' },
  { value: 'composite', label: '综合排序' },
]

const strategyLabel = computed(
  () => strategyOptions.find((item) => item.value === optimizeBy.value)?.label ?? '最短路径',
)

const routeNodes = computed(() => {
  const planned = plannerState.currentPlan?.routeSpotNames
  if (planned && planned.length > 0) {
    return planned
  }
  return [start.value, ...pass.value, end.value]
})

const routeText = computed(
  () => `${strategyLabel.value} · 共 ${routeNodes.value.length} 个景点 · 起点 ${start.value} → 终点 ${end.value}`,
)

const demoScene = computed(() => buildSpotDemoScene(routeNodes.value, allSpots))

function roleLabel(name: string) {
  if (name === start.value) return '始'
  if (name === end.value) return '终'
  if (pass.value.includes(name)) return '经'
  return ''
}

function roleClass(name: string) {
  if (name === start.value) return 'start'
  if (name === end.value) return 'end'
  if (pass.value.includes(name)) return 'pass'
  return ''
}

function selectSpot(name: string) {
  if (mode.value === 'start') {
    start.value = name
    pass.value = pass.value.filter((value) => value !== name)
    if (end.value === name) end.value = '清明上河园'
    return
  }
  if (mode.value === 'end') {
    end.value = name
    pass.value = pass.value.filter((value) => value !== name)
    if (start.value === name) start.value = '河南博物院'
    return
  }
  if (name === start.value || name === end.value) return
  if (pass.value.includes(name)) pass.value = pass.value.filter((value) => value !== name)
  else pass.value = [...pass.value, name]
}

function switchOptimizeBy(next: OptimizeBy) {
  optimizeBy.value = next
}

function confirmRoute() {
  syncCurrentPlanFromSelection(start.value, end.value, pass.value, optimizeBy.value)
  router.push('/route')
}

watch(
  [start, end, pass, optimizeBy],
  () => {
    syncCurrentPlanFromSelection(start.value, end.value, pass.value, optimizeBy.value)
  },
  { deep: true, immediate: true },
)
</script>
