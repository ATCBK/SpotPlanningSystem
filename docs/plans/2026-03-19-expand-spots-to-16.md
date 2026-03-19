# Expand Spots To 16 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the scenic spot overview from 12 to 16 real attractions within the existing six cities and attach real photos for each new attraction.

**Architecture:** Keep the route-planning city graph unchanged and extend only the scenic spot dataset that drives the overview and recommendation pages. Add a focused regression test for dataset size and required scenic spot names before changing production data, then verify the UI-facing build still succeeds.

**Tech Stack:** Vue 3, TypeScript, Vitest, Vite

---

### Task 1: Lock the new scenic spot inventory with a failing test

**Files:**
- Create: `frontend/tests/data/spots.test.ts`
- Modify: `frontend/src/data/spots.ts`

**Step 1: Write the failing test**

Add a test that asserts:
- `spots.length === 16`
- the dataset includes `二七纪念塔`、`洛阳博物馆`、`铁塔公园`、`卧龙岗武侯祠`
- all spots stay within the six existing cities

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the dataset still contains 12 scenic spots and is missing the new names.

### Task 2: Add the four new scenic spots with real photos

**Files:**
- Modify: `frontend/src/data/spots.ts`

**Step 1: Add minimal implementation**

Append four new `Spot` objects:
- 郑州 `二七纪念塔`
- 洛阳 `洛阳博物馆`
- 开封 `铁塔公园`
- 南阳 `卧龙岗武侯祠`

Use real image URLs for each attraction and keep the existing six-city scope unchanged.

**Step 2: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the new dataset test and existing route tests.

### Task 3: Verify the UI still handles the larger dataset

**Files:**
- Verify only: `frontend/src/views/SpotsOverview.vue`
- Verify only: `frontend/src/views/SmartRecommend.vue`

**Step 1: Build the app**

Run: `npm run build`
Expected: PASS with no TypeScript or Vite errors.

**Step 2: Perform a quick UI sanity check**

Run the local app and verify the overview page still renders cards, filtering works, and the recommendation page still displays selectable spots without layout collapse.

