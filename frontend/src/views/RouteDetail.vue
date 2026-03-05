<template>
  <section class="page">
    <TopNav />

    <header class="page-header">
      <h2>{{ text.title }}</h2>
    </header>

    <section class="route-layout">
      <div class="route-map-card">
        <h3>{{ text.mapTitle }}</h3>
        <div class="route-meta">{{ text.routeMeta }}</div>
        <div class="route-map" :style="{ backgroundImage: `url(${mapBg})` }">
          <span class="dot d1">{{ text.spot1 }}</span>
          <span class="dot d2 active">{{ text.spot2 }}</span>
          <span class="dot d3">{{ text.spot3 }}</span>
          <span class="dot d4">{{ text.spot4 }}</span>
          <span class="dot d5">{{ text.spot5 }}</span>
        </div>
      </div>

      <aside class="segment-card">
        <h3>{{ text.tableTitle }}</h3>
        <table>
          <thead>
            <tr>
              <th>{{ text.col1 }}</th>
              <th>{{ text.col2 }}</th>
              <th>{{ text.col3 }}</th>
              <th>{{ text.col4 }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.name">
              <td>{{ row.name }}</td>
              <td>{{ row.km }}</td>
              <td>{{ row.h }}</td>
              <td>{{ row.price }}</td>
            </tr>
          </tbody>
        </table>
        <p class="sum">{{ text.sum }}</p>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import TopNav from '../components/TopNav.vue'

const mapBg = '/images/route-map-bg.jpg'
const text = {
  title: '\u8def\u5f84\u8be6\u60c5',
  mapTitle: '\u666f\u70b9\u5730\u7406\u8def\u5f84\u56fe',
  routeMeta: '\u6cb3\u535a \u9f99\u95e8\u77f3\u7a9f \u767d\u9a6c\u5bfa \u6e05\u660e\u4e0a\u6cb3\u56ed \u5305\u516c\u7960',
  spot1: '\u6cb3\u535a',
  spot2: '\u9f99\u95e8\u77f3\u7a9f',
  spot3: '\u767d\u9a6c\u5bfa',
  spot4: '\u6e05\u660e\u4e0a\u6cb3\u56ed',
  spot5: '\u5305\u516c\u7960',
  tableTitle: '\u666f\u70b9\u5206\u6bb5\u660e\u7ec6',
  col1: '\u533a\u95f4',
  col2: '\u8ddd\u79bb',
  col3: '\u65f6\u957f',
  col4: '\u8d39\u7528',
  sum: '\u5408\u8ba1\uff086 \u666f\u70b9\uff09 319km 6.0h \u00a5485',
}
const rows = [
  { name: '\u6cb3\u535a\u2192\u5c11\u6797\u5bfa', km: '78km', h: '1.4h', price: '\u00a5120' },
  { name: '\u5c11\u6797\u5bfa\u2192\u9f99\u95e8\u77f3\u7a9f', km: '66km', h: '1.2h', price: '\u00a595' },
  { name: '\u9f99\u95e8\u77f3\u7a9f\u2192\u767d\u9a6c\u5bfa', km: '18km', h: '0.6h', price: '\u00a540' },
  { name: '\u767d\u9a6c\u5bfa\u2192\u6e05\u660e\u4e0a\u6cb3\u56ed', km: '152km', h: '2.6h', price: '\u00a5210' },
  { name: '\u6e05\u660e\u4e0a\u6cb3\u56ed\u2192\u5305\u516c\u7960', km: '5km', h: '0.2h', price: '\u00a520' },
]
</script>
