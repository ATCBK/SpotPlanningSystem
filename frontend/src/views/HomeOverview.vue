<template>
  <section class="page">
    <TopNav />

    <section class="hero" :style="{ backgroundImage: `url(${heroImg})` }">
      <div class="hero-overlay"></div>
      <h2>豫见河南</h2>
      <p>一键生成中原文化路线<br />与山水风景最优旅程</p>
      <div class="hero-tags">
        <span class="tag warm">文化古都线</span>
        <span class="tag cool">山水风景线</span>
      </div>
    </section>

    <section class="section-card">
      <h3>中原风华 · 城市名片</h3>
      <p>以古都文明与山水胜景，展示河南文旅魅力</p>
      <div class="city-grid">
        <article v-for="item in cards" :key="item.name" class="city-card">
          <img :src="item.img" :alt="item.name" />
          <h4>{{ item.name }}</h4>
          <small>{{ item.meta }}</small>
        </article>
        <aside class="summary-card">
          <h4>河南文旅数据</h4>
          <p>12 城市 · 38 景点</p>
          <small>3 条主题线路，2 套智能推荐</small>
        </aside>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import TopNav from '../components/TopNav.vue'

const heroImg =
  'https://images.unsplash.com/photo-1599583708181-abd43120ef76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4Mzl8&ixlib=rb-4.1.0&q=80&w=1080'

const cards = [
  {
    name: '洛阳 · 龙门石窟',
    meta: '十三朝古都，石刻艺术巅峰',
    img: 'https://images.unsplash.com/photo-1664980329978-ba559c713693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI5MzZ8&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: '登封 · 少林寺',
    meta: '禅武文化，世界功夫名片',
    img: 'https://images.unsplash.com/photo-1584083221342-379999f859fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI5Mzd8&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: '开封 · 清明上河园',
    meta: '宋韵华灯，沉浸式体验',
    img: 'https://images.unsplash.com/photo-1758383077073-7d33cfb66c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI5Mzh8&ixlib=rb-4.1.0&q=80&w=1080',
  },
]
</script>

