# 豫见河南 Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chinese-style PC web app named "豫见河南" that demonstrates a full tourism recommendation flow powered by shortest-path routing.

**Architecture:** Create a Vue 3 + Vite SPA with 5 route-driven pages and a shared Pinia store for user preferences and itinerary state. Use local JSON-like TypeScript data modules for cities/spots/edges and run Dijkstra in a dedicated utility module. Keep product experience first; algorithm details are surfaced only in the route details panel.

**Tech Stack:** Vue 3, Vite, TypeScript, Vue Router, Pinia, ECharts, Vitest, Vue Test Utils, Playwright

---

### Task 1: Scaffold Project and Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/style.css`
- Create: `tests/smoke/app.smoke.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'

describe('app bootstrap', () => {
  it('loads test runtime', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/smoke/app.smoke.test.ts`
Expected: FAIL because dependencies/scripts are not installed yet.

**Step 3: Write minimal implementation**

```json
{
  "name": "yujian-henan",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm install && npm run test -- tests/smoke/app.smoke.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/main.ts src/App.vue src/style.css tests/smoke/app.smoke.test.ts
git commit -m "chore: scaffold vue vite project with test runtime"
```

### Task 2: Add Routing Shell for 5 Pages

**Files:**
- Create: `src/router/index.ts`
- Create: `src/views/HomeView.vue`
- Create: `src/views/SpotsView.vue`
- Create: `src/views/RecommendView.vue`
- Create: `src/views/RouteDetailView.vue`
- Create: `src/views/ItineraryView.vue`
- Modify: `src/App.vue`
- Test: `tests/router/routes.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { router } from '../../src/router'

describe('routes', () => {
  it('contains all core pages', () => {
    const names = router.getRoutes().map(r => r.name)
    expect(names).toEqual(expect.arrayContaining(['home', 'spots', 'recommend', 'route-detail', 'itinerary']))
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/router/routes.test.ts`
Expected: FAIL because router module does not exist.

**Step 3: Write minimal implementation**

```ts
export const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/spots', name: 'spots', component: () => import('../views/SpotsView.vue') },
  { path: '/recommend', name: 'recommend', component: () => import('../views/RecommendView.vue') },
  { path: '/route-detail', name: 'route-detail', component: () => import('../views/RouteDetailView.vue') },
  { path: '/itinerary', name: 'itinerary', component: () => import('../views/ItineraryView.vue') }
]
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/router/routes.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/router/index.ts src/views/*.vue src/App.vue tests/router/routes.test.ts
git commit -m "feat: add five-page routing shell"
```

### Task 3: Establish Chinese-Style Design Tokens and Layout

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/components/AppHeader.vue`
- Modify: `src/App.vue`
- Modify: `src/style.css`
- Test: `tests/ui/theme-token.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

describe('theme tokens', () => {
  it('defines Chinese-style core color variables', () => {
    const css = fs.readFileSync('src/styles/tokens.css', 'utf-8')
    expect(css).toContain('--color-daiqing')
    expect(css).toContain('--color-zhusha')
    expect(css).toContain('--color-mibai')
    expect(css).toContain('--color-mohei')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/theme-token.test.ts`
Expected: FAIL because tokens file does not exist.

**Step 3: Write minimal implementation**

```css
:root {
  --color-daiqing: #1f4d4f;
  --color-zhusha: #b33a3a;
  --color-mibai: #f7f3ea;
  --color-mohei: #2b2b2b;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/theme-token.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/styles/tokens.css src/components/AppHeader.vue src/App.vue src/style.css tests/ui/theme-token.test.ts
git commit -m "feat: add Chinese-style visual tokens and global shell"
```

### Task 4: Build Static Data Modules (Cities, Edges, Spots)

**Files:**
- Create: `src/data/cities.ts`
- Create: `src/data/edges.ts`
- Create: `src/data/spots.ts`
- Create: `src/types/domain.ts`
- Test: `tests/data/data-shape.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { cities } from '../../src/data/cities'
import { edges } from '../../src/data/edges'
import { spots } from '../../src/data/spots'

describe('mock data shape', () => {
  it('has enough content for demo flow', () => {
    expect(cities.length).toBeGreaterThanOrEqual(8)
    expect(edges.length).toBeGreaterThanOrEqual(10)
    expect(spots.length).toBeGreaterThanOrEqual(16)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/data/data-shape.test.ts`
Expected: FAIL because data modules do not exist.

**Step 3: Write minimal implementation**

```ts
export const cities = [{ id: 'zhengzhou', name: '郑州', x: 320, y: 220 }]
```

(Add sufficient mock entries to satisfy test thresholds.)

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/data/data-shape.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/data/cities.ts src/data/edges.ts src/data/spots.ts src/types/domain.ts tests/data/data-shape.test.ts
git commit -m "feat: add mock domain data for henan travel graph"
```

### Task 5: Implement Dijkstra Shortest Path Utility

**Files:**
- Create: `src/utils/dijkstra.ts`
- Test: `tests/algorithm/dijkstra.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { shortestPath } from '../../src/utils/dijkstra'

describe('shortestPath', () => {
  it('returns city sequence and total distance', () => {
    const result = shortestPath('zhengzhou', 'luoyang')
    expect(result.path[0]).toBe('zhengzhou')
    expect(result.path[result.path.length - 1]).toBe('luoyang')
    expect(result.totalDistance).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/algorithm/dijkstra.test.ts`
Expected: FAIL because utility does not exist.

**Step 3: Write minimal implementation**

```ts
export function shortestPath(startId: string, endId: string) {
  return { path: [startId, endId], totalDistance: 1 }
}
```

Then replace with actual Dijkstra while preserving the same return shape.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/algorithm/dijkstra.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/utils/dijkstra.ts tests/algorithm/dijkstra.test.ts
git commit -m "feat: implement shortest-path utility with tests"
```

### Task 6: Add Pinia Store for Recommendation Flow

**Files:**
- Create: `src/stores/plan.ts`
- Modify: `src/main.ts`
- Test: `tests/store/plan-store.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanStore } from '../../src/stores/plan'

describe('plan store', () => {
  it('persists preference and computed route summary', () => {
    setActivePinia(createPinia())
    const store = usePlanStore()
    store.setPreference({ startCity: 'zhengzhou', days: 3, budget: 1800, tags: ['culture'] })
    expect(store.preference.startCity).toBe('zhengzhou')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/store/plan-store.test.ts`
Expected: FAIL because store does not exist.

**Step 3: Write minimal implementation**

```ts
export const usePlanStore = defineStore('plan', {
  state: () => ({ preference: { startCity: '', days: 0, budget: 0, tags: [] as string[] } }),
  actions: {
    setPreference(payload) {
      this.preference = payload
    }
  }
})
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/store/plan-store.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/stores/plan.ts src/main.ts tests/store/plan-store.test.ts
git commit -m "feat: add plan store for cross-page recommendation state"
```

### Task 7: Implement Spots Overview Page (Aesthetic Priority)

**Files:**
- Create: `src/components/SpotCard.vue`
- Create: `src/components/SpotFilterPanel.vue`
- Modify: `src/views/SpotsView.vue`
- Test: `tests/views/spots-view.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpotsView from '../../src/views/SpotsView.vue'

describe('SpotsView', () => {
  it('renders filter area and spot card list', () => {
    const wrapper = mount(SpotsView)
    expect(wrapper.text()).toContain('景点总览')
    expect(wrapper.findAll('[data-testid="spot-card"]').length).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/views/spots-view.test.ts`
Expected: FAIL before components and test ids are present.

**Step 3: Write minimal implementation**

```vue
<template>
  <section>
    <h1>景点总览</h1>
    <div data-testid="spot-card">示例景点</div>
  </section>
</template>
```

Then expand to full Chinese-style grid and filters.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/views/spots-view.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/SpotCard.vue src/components/SpotFilterPanel.vue src/views/SpotsView.vue tests/views/spots-view.test.ts
git commit -m "feat: build chinese-style spots overview page"
```

### Task 8: Implement Recommendation and Route Detail Pages

**Files:**
- Create: `src/components/PreferenceForm.vue`
- Create: `src/components/RouteCandidateCard.vue`
- Create: `src/components/RouteGraph.vue`
- Modify: `src/views/RecommendView.vue`
- Modify: `src/views/RouteDetailView.vue`
- Test: `tests/views/recommend-route-detail.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendView from '../../src/views/RecommendView.vue'

describe('RecommendView', () => {
  it('shows shortest-path-first strategy label', () => {
    const wrapper = mount(RecommendView)
    expect(wrapper.text()).toContain('最短路径优先')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/views/recommend-route-detail.test.ts`
Expected: FAIL because strategy UI is missing.

**Step 3: Write minimal implementation**

```vue
<template>
  <section>
    <h1>智能推荐</h1>
    <p>最短路径优先</p>
  </section>
</template>
```

Then wire form -> store -> dijkstra -> route detail graph.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/views/recommend-route-detail.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/PreferenceForm.vue src/components/RouteCandidateCard.vue src/components/RouteGraph.vue src/views/RecommendView.vue src/views/RouteDetailView.vue tests/views/recommend-route-detail.test.ts
git commit -m "feat: add recommendation flow and route detail visualization"
```

### Task 9: Implement Itinerary Result Page and Error Fallbacks

**Files:**
- Create: `src/components/ItineraryTimeline.vue`
- Modify: `src/views/ItineraryView.vue`
- Create: `src/components/EmptyStatePanel.vue`
- Modify: `src/views/RecommendView.vue`
- Test: `tests/views/itinerary-and-fallbacks.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ItineraryView from '../../src/views/ItineraryView.vue'

describe('ItineraryView', () => {
  it('renders day timeline blocks', () => {
    const wrapper = mount(ItineraryView)
    expect(wrapper.text()).toContain('行程结果')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/views/itinerary-and-fallbacks.test.ts`
Expected: FAIL before timeline/fallback components are added.

**Step 3: Write minimal implementation**

```vue
<template>
  <section>
    <h1>行程结果</h1>
  </section>
</template>
```

Then add day-by-day timeline and no-result fallback actions.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/views/itinerary-and-fallbacks.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ItineraryTimeline.vue src/components/EmptyStatePanel.vue src/views/ItineraryView.vue src/views/RecommendView.vue tests/views/itinerary-and-fallbacks.test.ts
git commit -m "feat: add itinerary output and fallback handling"
```

### Task 10: End-to-End Demo Verification and Documentation

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/demo-flow.spec.ts`
- Create: `docs/demo-script.md`
- Modify: `README.md`

**Step 1: Write the failing test**

```ts
import { test, expect } from '@playwright/test'

test('demo flow runs from home to itinerary', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('豫见河南')).toBeVisible()
})
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/demo-flow.spec.ts`
Expected: FAIL before playwright setup.

**Step 3: Write minimal implementation**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: { baseURL: 'http://localhost:5173' }
})
```

Then complete flow assertions: Home -> Spots -> Recommend -> RouteDetail -> Itinerary.

**Step 4: Run test to verify it passes**

Run: `npm run dev` (terminal 1) and `npx playwright test tests/e2e/demo-flow.spec.ts` (terminal 2)
Expected: PASS.

**Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/demo-flow.spec.ts docs/demo-script.md README.md
git commit -m "test: add e2e demo flow and presentation docs"
```

### Task 11: Final Quality Gate

**Files:**
- Modify: `package.json` (scripts)
- Modify: `README.md` (verification section)

**Step 1: Write the failing test**

```ts
// No new unit test. This is a quality gate task.
```

**Step 2: Run test to verify it fails**

Run: `npm run lint && npm run test && npm run build`
Expected: At least one command fails before scripts/setup are complete.

**Step 3: Write minimal implementation**

```json
{
  "scripts": {
    "verify": "npm run test && npm run build"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run verify`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json README.md
git commit -m "chore: add final verification gate"
```
