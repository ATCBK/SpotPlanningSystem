<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { label: '首页总览', path: '/home', bg: '/images/generated-1772603741176.png' },
  { label: '景点总览', path: '/spots', bg: '/images/generated-1772603747022.png' },
  { label: '智能推荐', path: '/recommend', bg: '/images/generated-1772603753074.png' },
  { label: '行程结果', path: '/result', bg: '/images/generated-1772603866990.png' },
]

const current = computed(() => route.path)
</script>

<template>
  <header class="top-nav">
    <div class="top-nav-mask"></div>
    <div class="brand">
      <h1>豫见河南</h1>
      <p>中原古韵 · 智行路线</p>
    </div>
    <nav class="nav-list">
      <RouterLink
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="nav-pill"
        :class="{ active: current === item.path }"
        :style="{ backgroundImage: `url(${item.bg})` }"
      >
        <span class="nav-pill-mask"></span>
        <span class="nav-pill-text">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </header>
</template>
