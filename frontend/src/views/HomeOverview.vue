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
          <div class="city-card-overlay">
            <h4>{{ item.name }} · {{ item.scoreText }}</h4>
            <small>{{ item.detailText }}</small>
            <button type="button">{{ item.buttonLabel }}</button>
          </div>
        </article>
        <aside class="summary-card">
          <span class="summary-kicker">{{ poster.eyebrow }}</span>
          <h4>{{ poster.title }}</h4>
          <p class="summary-tagline">{{ poster.tagline }}</p>
          <div class="summary-stats">
            <div v-for="item in poster.stats" :key="item.label" class="summary-stat">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
          <small>{{ poster.footer }}</small>
        </aside>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import TopNav from '../components/TopNav.vue'
import { spots } from '../data/spots'
import { buildHomeOverviewContent } from '../utils/home-overview'

const heroImg =
  'https://images.unsplash.com/photo-1599583708181-abd43120ef76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI1OTI4Mzl8&ixlib=rb-4.1.0&q=80&w=1080'

const { featuredCards: cards, poster } = buildHomeOverviewContent(spots)
</script>
