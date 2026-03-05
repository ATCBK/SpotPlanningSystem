<template>
  <section class="page">
    <TopNav />

    <section class="result-hero" :style="{ backgroundImage: `url(${hero})` }">
      <h2>{{ text.title }}</h2>
      <div class="hero-actions">
        <button class="dark" @click="exportGuide">{{ text.export }}</button>
        <button class="light" @click="shareGuide">{{ text.share }}</button>
      </div>
    </section>

    <section class="result-body" :style="{ backgroundImage: `url(${bodyBg})` }">
      <div class="result-mask"></div>
      <article class="left-copy">
        <h3>{{ text.guideTitle }}</h3>
        <p>{{ text.guideSub }}</p>
        <div class="hero-tags">
          <span class="tag warm">{{ text.tag1 }}</span>
          <span class="tag cool">{{ text.tag2 }}</span>
        </div>
        <ul>
          <li><b>{{ text.day1 }}</b> {{ text.day1d }}</li>
          <li><b>{{ text.day2 }}</b> {{ text.day2d }}</li>
          <li><b>{{ text.day3 }}</b> {{ text.day3d }}</li>
        </ul>
      </article>

      <article class="summary">
        <h4>{{ text.summary }}</h4>
        <dl>
          <div><dt>{{ text.kmLabel }}</dt><dd>286 km</dd></div>
          <div><dt>{{ text.timeLabel }}</dt><dd>7.5 h</dd></div>
          <div><dt>{{ text.costLabel }}</dt><dd>¥1680</dd></div>
        </dl>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import TopNav from '../components/TopNav.vue'

const hero = '/images/result-hero.jpg'
const bodyBg = '/images/result-body.jpg'
const text = {
  title: '\u884c\u7a0b\u7ed3\u679c',
  export: '\u5bfc\u51fa\u653b\u7565\u56fe',
  share: '\u5206\u4eab\u884c\u7a0b',
  guideTitle: '\u4e09\u65e5\u4e2d\u539f\u4eba\u6587\u653b\u7565',
  guideSub: '\u53e4\u90fd\u6f2b\u6e38 \u00b7 \u7985\u610f\u5c71\u6c34 \u00b7 \u5b8b\u97f5\u591c\u6e38',
  tag1: '\u6587\u5316\u53e4\u90fd\u7ebf',
  tag2: '\u5c71\u6c34\u98ce\u666f\u7ebf',
  day1: 'Day 1 \u90d1\u5dde \u2192 \u6d1b\u9633',
  day1d: '\u4e0a\u5348\uff1a\u6cb3\u5357\u535a\u7269\u9662 | \u5348\u540e\uff1a\u9f99\u95e8\u77f3\u7a9f | \u591c\u95f4\uff1a\u6d1b\u9091\u53e4\u57ce',
  day2: 'Day 2 \u6d1b\u9633 \u2192 \u5f00\u5c01',
  day2d: '\u4e0a\u5348\uff1a\u767d\u9a6c\u5bfa | \u5348\u540e\uff1a\u6e05\u660e\u4e0a\u6cb3\u56ed | \u591c\u95f4\uff1a\u6c74\u6cb3\u706f\u5f71',
  day3: 'Day 3 \u5f00\u5c01 \u2192 \u90d1\u5dde\u8fd4\u7a0b',
  day3d: '\u4e0a\u5348\uff1a\u5305\u516c\u7960 | \u5348\u540e\uff1a\u5b8b\u90fd\u5fa1\u8857 | \u508d\u665a\uff1a\u8fd4\u7a0b',
  summary: '\u884c\u7a0b\u603b\u89c8',
  kmLabel: '\u603b\u91cc\u7a0b',
  timeLabel: '\u603b\u65f6\u957f',
  costLabel: '\u9884\u8ba1\u8d39\u7528',
}

function exportGuide() {
  const content = [
    text.guideTitle,
    text.day1 + ' ' + text.day1d,
    text.day2 + ' ' + text.day2d,
    text.day3 + ' ' + text.day3d,
    `总里程: 286 km`,
    `总时长: 7.5 h`,
    `预计费用: ¥1680`,
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '豫见河南-行程攻略.txt'
  link.click()
  URL.revokeObjectURL(link.href)
}

async function shareGuide() {
  const shareText = `${text.guideTitle}\n${text.day1}\n${text.day2}\n${text.day3}`
  if (navigator.share) {
    await navigator.share({ title: text.title, text: shareText })
    return
  }
  await navigator.clipboard.writeText(shareText)
  alert('行程文案已复制，可直接分享')
}
</script>
