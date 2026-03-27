# A* Search Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current shortest-path demo feel with an A* search-process visualization that clearly shows frontier expansion, candidate edges, rejected branches, and convergence to the optimal route.

**Architecture:** Keep the existing `RouteDemoCanvas` rendering shell, but change the trace source from Dijkstra-style relaxations to A*-style search steps with heuristic-driven candidate evaluation. Then update the scenic recommendation demo generator to prioritize search-process visibility over simple start/end result edges.

**Tech Stack:** Vue 3, TypeScript, Vitest, existing route demo utilities.

---

### Task 1: Lock the expected A* demo behavior with tests

**Files:**
- Modify: `frontend/tests/utils/demo-visual.test.ts`
- Modify: `frontend/tests/algorithm/dijkstra.test.ts`

**Step 1: Write failing tests**
- Add assertions that trace output expands multiple candidates before final convergence.
- Add assertions that city demo events represent search-phase ordering, not just direct final-edge playback.

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/algorithm/dijkstra.test.ts tests/utils/demo-visual.test.ts`

Expected: FAIL because the current trace is still Dijkstra-shaped and the spot demo still over-focuses on direct final edges.

### Task 2: Replace trace generation with A* semantics

**Files:**
- Modify: `frontend/src/utils/dijkstra.ts`
- Modify: `frontend/src/utils/demo-visual.ts`

**Step 1: Implement minimal A* trace support**
- Add heuristic evaluation based on `cityPoints`.
- Record search steps with candidate totals that include heuristic scoring.
- Preserve existing public result shape where practical so planner code stays stable.

**Step 2: Update demo scene generation**
- Make city and spot demos emit richer search exploration events.
- Ensure the recommend-page demo visibly explores intermediate nodes even when only start and end spots are selected.

### Task 3: Verify and visually inspect

**Files:**
- No new source files required

**Step 1: Run targeted tests**

Run: `npm test -- tests/algorithm/dijkstra.test.ts tests/utils/demo-visual.test.ts tests/utils/demo-edge-render.test.ts`

Expected: PASS

**Step 2: Run production build**

Run: `npm run build`

Expected: PASS

**Step 3: Verify in browser**

Run the local Vite server, open the recommend and route pages, and confirm the demo shows:
- multiple candidate expansions
- visible rejected branches
- gradual convergence to the final path
