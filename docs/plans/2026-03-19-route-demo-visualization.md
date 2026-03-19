# Route Demo Visualization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 10-second demo-style route visualization with scenic SVG icons, trial edges, final path convergence, and fullscreen playback for both recommendation and route-detail pages.

**Architecture:** Keep the real route-planning algorithm untouched and add a separate presentation layer that generates demo nodes, probe edges, rejected edges, and final edges from the confirmed route data. Reuse one scenic icon system and one fullscreen presentation component across both pages so the animation language stays consistent.

**Tech Stack:** Vue 3, TypeScript, Vitest, Vite

---

### Task 1: Lock the demo data contract with failing tests

**Files:**
- Create: `frontend/tests/utils/demo-visual.test.ts`
- Create: `frontend/src/utils/demo-visual.ts`
- Create: `frontend/src/data/spot-icons.ts`

**Step 1: Write the failing tests**

Add tests that assert:
- every scenic spot has a corresponding icon definition
- the spot demo scene produces probe edges, rejected edges, and final edges
- the demo scene total duration is close to 10 seconds
- the city demo scene marks active cities and exposes final edges

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the new demo utilities and icon registry do not exist yet.

### Task 2: Implement the reusable icon and timeline generators

**Files:**
- Create: `frontend/src/data/spot-icons.ts`
- Create: `frontend/src/utils/demo-visual.ts`
- Create: `frontend/src/components/ScenicNodeIcon.vue`

**Step 1: Add minimal implementation**

Create:
- a per-spot icon registry with SVG metadata
- a demo generator for scenic-spot timelines
- a demo generator for city timelines
- a small SVG-rendering component for the node icon

**Step 2: Run tests to verify they pass**

Run: `npm test`
Expected: PASS for the new utility tests and existing data tests.

### Task 3: Integrate the demo animation into the recommendation page

**Files:**
- Modify: `frontend/src/views/SmartRecommend.vue`
- Modify: `frontend/src/style.css`

**Step 1: Replace the simple node animation**

Use the generated scenic demo scene to show:
- scattered icon nodes with labels
- trial edges
- rejected edges fading out
- final edges converging
- a fullscreen demo button and playback controls

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

### Task 4: Reuse the same presentation model on the route-detail page

**Files:**
- Modify: `frontend/src/views/RouteDetail.vue`
- Modify: `frontend/src/style.css`

**Step 1: Add city-level comparison animation**

Use the city demo scene for the route detail map and connect the fullscreen overlay to the same controls.

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

### Task 5: Sanity-check the front end

**Files:**
- Verify only: `frontend/src/views/SmartRecommend.vue`
- Verify only: `frontend/src/views/RouteDetail.vue`

**Step 1: Run preview and inspect**

Run preview, open the two pages, and verify:
- no broken images
- fullscreen opens and closes
- animation runs for about 10 seconds
- final state remains visible after playback

