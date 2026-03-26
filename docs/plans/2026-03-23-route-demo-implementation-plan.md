# Route Demo Phased Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repair overlapping nodes in the dynamic route demo and add phased algorithm-step events so the recommendation and route-detail pages clearly show probing, comparison, rejection, and progression to the next node.

**Architecture:** Keep the existing `DemoScene` contract as the main transport object, then extend it with a phased event timeline that `RouteDemoCanvas` can interpret on each animation frame. Fix overlap at the scene-building layer by assigning deterministic non-overlapping final positions for same-city scenic spots before wiring the new event-driven styles into the canvas renderer.

**Tech Stack:** Vue 3, TypeScript, computed state in `script setup`, Vitest

---

### Task 1: Add failing tests for phased demo scene output

**Files:**
- Modify: `frontend/tests/utils/demo-visual.test.ts`

**Step 1: Write the failing test**

```ts
it('emits ordered phase events for probe, reject, choose, and settle actions', () => {
  const scene = buildCityDemoScene(['郑州', '焦作', '洛阳'], 'distance')

  expect(scene.events.some((event) => event.type === 'focus-node')).toBe(true)
  expect(scene.events.some((event) => event.type === 'probe-edge')).toBe(true)
  expect(scene.events.some((event) => event.type === 'reject-edge')).toBe(true)
  expect(scene.events.some((event) => event.type === 'choose-edge')).toBe(true)
  expect(scene.events.some((event) => event.type === 'settle-node')).toBe(true)
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/utils/demo-visual.test.ts`
Expected: FAIL because `scene.events` does not exist yet.

**Step 3: Write minimal implementation**

Add event types and populate a phased event list in `frontend/src/utils/demo-visual.ts`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/utils/demo-visual.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/tests/utils/demo-visual.test.ts frontend/src/utils/demo-visual.ts
git commit -m "test: cover phased route demo events"
```

### Task 2: Add failing test for non-overlapping scenic node positions

**Files:**
- Modify: `frontend/tests/utils/demo-visual.test.ts`

**Step 1: Write the failing test**

```ts
it('assigns unique final positions to active scenic nodes in the same city cluster', () => {
  const routeSpotNames = ['河南博物院', '少林寺', '龙门石窟', '白马寺']
  const scene = buildSpotDemoScene(routeSpotNames, spots, 'distance')
  const activeNodes = scene.nodes.filter((node) => node.active)

  expect(new Set(activeNodes.map((node) => `${node.x}-${node.y}`)).size).toBe(activeNodes.length)
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/utils/demo-visual.test.ts`
Expected: FAIL when same-city offsets still collide.

**Step 3: Write minimal implementation**

Replace fixed per-index scenic offsets with deterministic grouped layout logic in `frontend/src/utils/demo-visual.ts`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/utils/demo-visual.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/tests/utils/demo-visual.test.ts frontend/src/utils/demo-visual.ts
git commit -m "fix: prevent overlap in scenic demo nodes"
```

### Task 3: Update demo canvas to consume phased events

**Files:**
- Modify: `frontend/src/components/RouteDemoCanvas.vue`
- Modify: `frontend/src/utils/demo-visual.ts`

**Step 1: Write the failing test**

Add assertions in `frontend/tests/utils/demo-visual.test.ts` proving chosen edges settle after probe edges and rejected edges fade separately.

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/utils/demo-visual.test.ts`
Expected: FAIL because render state logic does not yet map event phases to node and edge states.

**Step 3: Write minimal implementation**

Teach `RouteDemoCanvas.vue` to derive:

- current node state
- visited node state
- candidate node state
- chosen edge visibility
- rejected edge fade timing

from the event list and current playhead.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/utils/demo-visual.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/RouteDemoCanvas.vue frontend/src/utils/demo-visual.ts frontend/tests/utils/demo-visual.test.ts
git commit -m "feat: render phased route demo animation"
```

### Task 4: Verify recommendation and route-detail regression safety

**Files:**
- Verify only: `frontend/src/views/SmartRecommend.vue`
- Verify only: `frontend/src/views/RouteDetail.vue`

**Step 1: Run targeted tests**

Run: `npm run test -- tests/utils/demo-visual.test.ts tests/state/planner.test.ts`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Manual regression spot check**

Run: `npm run dev`
Expected: `/recommend` and `/route` both show non-overlapping nodes and phased algorithm motion.

**Step 4: Commit**

```bash
git add frontend/src/components/RouteDemoCanvas.vue frontend/src/utils/demo-visual.ts frontend/tests/utils/demo-visual.test.ts
git commit -m "fix: clarify route demo algorithm progression"
```
