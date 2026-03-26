# Dijkstra Demo Ancient Style Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the route demo in this project so both chain diagrams use a Dijkstra-driven process, auto-label edge weights based on the active strategy, and render with an ancient-style presentation.

**Architecture:** Extend the pathfinding utility to expose trace steps and formatted edge weights without changing the existing route-plan output. Then rebuild the demo scene generator around those trace steps and update the reusable canvas component plus styles to render algorithm-driven probe edges, rejected edges, final path edges, and inline weight labels in an ancient-style visual system.

**Tech Stack:** Vue 3, TypeScript, Vitest, Vite, existing CSS in `frontend/src/style.css`

---

### Task 1: Add traceable Dijkstra output and weight formatting

**Files:**
- Modify: `frontend/src/utils/dijkstra.ts`
- Test: `frontend/tests/algorithm/dijkstra.test.ts`

**Step 1: Write the failing test**

Add a test that expects:
- a trace step list for a shortest-path search
- accepted and rejected relaxations
- strategy-specific weight labels for distance, cost, and composite modes

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/algorithm/dijkstra.test.ts`
Expected: FAIL because trace output and formatting helpers do not exist yet.

**Step 3: Write minimal implementation**

Implement:
- a `shortestPathWithTrace` function that records relaxation steps
- strategy-aware edge-weight helpers
- final-path edge annotations

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/algorithm/dijkstra.test.ts`
Expected: PASS

### Task 2: Rebuild demo scenes from real algorithm steps

**Files:**
- Modify: `frontend/src/utils/demo-visual.ts`
- Modify: `frontend/src/views/SmartRecommend.vue`
- Modify: `frontend/src/views/RouteDetail.vue`
- Test: `frontend/tests/utils/demo-visual.test.ts`

**Step 1: Write the failing test**

Add expectations that the generated demo scenes:
- include weight labels on edges
- use algorithm trace edges rather than synthetic random decoys
- reflect the active optimization strategy

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/demo-visual.test.ts`
Expected: FAIL because scenes do not yet expose strategy-aware labeled edges.

**Step 3: Write minimal implementation**

Update the scene builders to:
- consume route spot names plus strategy
- derive Dijkstra traces from the current city graph
- output labeled probe, rejected, and final edges

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/demo-visual.test.ts`
Expected: PASS

### Task 3: Render ancient-style weighted demos

**Files:**
- Modify: `frontend/src/components/RouteDemoCanvas.vue`
- Modify: `frontend/src/style.css`

**Step 1: Update the canvas**

Render:
- edge labels near the animated midpoint
- current-node emphasis
- final-path labels that remain visible in final mode

**Step 2: Apply ancient-style visuals**

Adjust the demo area to use:
- parchment-like background and mask
- ink-gray probe lines
- cinnabar final lines
- seal/tag-like weight labels and node frames

**Step 3: Keep controls and fullscreen intact**

Preserve replay, pause, final-only view, and fullscreen behavior.

### Task 4: Verify end-to-end

**Files:**
- Verify only

**Step 1: Run focused tests**

Run: `npm test -- tests/algorithm/dijkstra.test.ts`

Run: `npm test -- tests/utils/demo-visual.test.ts`

**Step 2: Run full suite**

Run: `npm test`

**Step 3: Run production build**

Run: `npm run build`

**Step 4: Review the recommendation and route pages visually**

Confirm that:
- edge labels follow the selected strategy
- the animation reflects Dijkstra relaxation steps
- the ancient-style theme applies only to the demo area
