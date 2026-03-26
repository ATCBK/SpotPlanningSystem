<template>
  <section class="page">
    <TopNav />

    <section class="result-hero" :style="{ backgroundImage: `url(${hero})` }">
      <h2>行程结果</h2>
      <div class="hero-actions">
        <button class="dark" @click="exportGuide">导出攻略图</button>
        <button class="light" @click="shareGuide">分享行程</button>
      </div>
    </section>

    <section v-if="plan" class="result-body" :style="{ backgroundImage: `url(${bodyBg})` }">
      <div class="result-mask"></div>
      <article class="left-copy">
        <h3>三日中原人文攻略</h3>
        <p>根据你的选择自动生成</p>
        <div class="hero-tags">
          <span class="tag warm">{{ plan.startSpot }} 出发</span>
          <span class="tag cool">{{ plan.endSpot }} 收束</span>
        </div>
        <ul>
          <li v-for="(line, index) in dayLines" :key="line"><b>Day {{ index + 1 }}</b> {{ line }}</li>
        </ul>
      </article>

      <article class="summary">
        <h4>行程总览</h4>
        <dl class="summary-grid">
          <div v-for="item in summaryItems" :key="item.label" class="summary-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
            <small v-if="item.note">{{ item.note }}</small>
          </div>
        </dl>
      </article>
    </section>

    <section v-else class="section-card">
      <h3>暂无行程结果</h3>
      <p>请先在“智能推荐”页确认路线。</p>
      <RouterLink to="/recommend" class="primary" style="display:inline-block;text-decoration:none;">去智能推荐</RouterLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopNav from '../components/TopNav.vue'
import { plannerState } from '../state/planner'
import type { OptimizeBy } from '../utils/dijkstra'
import { buildTripSummaryItems } from '../utils/trip-result'

const hero = '/images/result-hero.jpg'
const bodyBg = '/images/result-body.jpg'
const plan = computed(() => plannerState.currentPlan)
const strategyLabelMap: Record<OptimizeBy, string> = {
  distance: '最短路径',
  cost: '最低成本',
  composite: '综合排序',
}
const strategyLabel = computed(() => strategyLabelMap[plan.value?.optimizeBy ?? 'distance'])
const summaryItems = computed(() => {
  if (!plan.value) {
    return []
  }
  return buildTripSummaryItems({
    optimizeByLabel: strategyLabel.value,
    totalDistance: plan.value.totalDistance,
    totalTime: plan.value.totalTime,
    totalCost: plan.value.totalCost,
    spotCount: plan.value.routeSpotNames.length,
  })
})

const dayLines = computed(() => {
  if (!plan.value) {
    return []
  }
  const route = plan.value.routeSpotNames
  const chunkSize = Math.max(1, Math.ceil(route.length / 3))
  const days: string[] = []
  for (let i = 0; i < route.length; i += chunkSize) {
    days.push(route.slice(i, i + chunkSize).join(' → '))
  }
  return days
})

function exportGuide() {
  if (!plan.value) {
    return
  }
  const content = [
    '豫见河南行程攻略',
    `策略: ${strategyLabel.value}`,
    `路线: ${plan.value.routeSpotNames.join(' -> ')}`,
    `总里程: ${plan.value.totalDistance} km`,
    `总时长: ${plan.value.totalTime.toFixed(1)} h`,
    `预计费用: ¥${plan.value.totalCost}`,
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '豫见河南-行程攻略.txt'
  link.click()
  URL.revokeObjectURL(link.href)
}

async function shareGuide() {
  if (!plan.value) {
    return
  }
  const shareText = `策略: ${strategyLabel.value}\n路线: ${plan.value.routeSpotNames.join(' -> ')}\n总里程: ${plan.value.totalDistance}km`
  if (navigator.share) {
    await navigator.share({ title: '行程结果', text: shareText })
    return
  }
  await navigator.clipboard.writeText(shareText)
  alert('行程文案已复制，可直接分享')
}
</script>
