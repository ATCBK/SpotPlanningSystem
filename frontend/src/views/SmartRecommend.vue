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
        <h3>景区链路图（Dijkstra）</h3>
        <p>当前依据：{{ routeText }}</p>
        <div class="mock-map" :style="{ backgroundImage: `url(${mapBg})` }">
          <div v-for="(n, idx) in routeNodes" :key="n" class="node" :style="nodePos[idx]">{{ n }}</div>
        </div>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TopNav from '../components/TopNav.vue'

type Mode = 'start' | 'end' | 'pass'

const mapBg =
  'https://images.unsplash.com/photo-1692892719022-f58c063924ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI2MDExMDl8&ixlib=rb-4.1.0&q=80&w=1080'

const spots = [
  { name: '河南博物院', meta: '郑州 · 文博', img: '/images/generated-1772603505554.png' },
  { name: '少林寺', meta: '登封 · 禅武', img: '/images/generated-1772603511344.png' },
  { name: '龙门石窟', meta: '洛阳 · 石刻', img: '/images/generated-1772603492567.png' },
  { name: '白马寺', meta: '洛阳 · 佛寺', img: '/images/generated-1772603759149.png' },
  { name: '清明上河园', meta: '开封 · 宋韵', img: '/images/generated-1772603499876.png' },
  { name: '包公祠', meta: '开封 · 名祠', img: '/images/generated-1772603860746.png' },
  { name: '殷墟', meta: '安阳 · 遗址', img: '/images/generated-1772603764558.png' },
  { name: '红旗渠', meta: '安阳 · 山水', img: 'https://images.unsplash.com/photo-1690956895349-b1676ac695ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODl8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '云台山', meta: '焦作 · 山水', img: 'https://images.unsplash.com/photo-1718158234699-5b41bba0518e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTk1ODh8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '嵩阳书院', meta: '郑州 · 古迹', img: 'https://images.unsplash.com/photo-1710926766648-f11bc333418f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: '医圣祠', meta: '南阳 · 医史', img: '/images/generated-1772603928894.png' },
  { name: '老君山', meta: '洛阳 · 山水', img: 'https://images.unsplash.com/photo-1761118270908-df3580048785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4NjR8&ixlib=rb-4.1.0&q=80&w=1080' },
]

const mode = ref<Mode>('start')
const start = ref('河南博物院')
const end = ref('清明上河园')
const pass = ref<string[]>(['少林寺', '龙门石窟'])
const confirmed = ref(false)

const routeNodes = computed(() => [start.value, ...pass.value, end.value].slice(0, 5))
const routeText = computed(() => `起点 ${start.value} → 终点 ${end.value}`)

const nodePos = [
  { left: '18%', top: '54%' },
  { left: '35%', top: '42%' },
  { left: '52%', top: '50%' },
  { left: '69%', top: '44%' },
  { left: '79%', top: '61%' },
]

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
    pass.value = pass.value.filter((p) => p !== name)
    if (end.value === name) end.value = '清明上河园'
    return
  }
  if (mode.value === 'end') {
    end.value = name
    pass.value = pass.value.filter((p) => p !== name)
    if (start.value === name) start.value = '河南博物院'
    return
  }
  if (name === start.value || name === end.value) return
  if (pass.value.includes(name)) pass.value = pass.value.filter((p) => p !== name)
  else pass.value = [...pass.value, name]
}

function confirmRoute() {
  confirmed.value = true
}
</script>

