# Home Overview Poster Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the home page "河南文旅数据" block into a poster-style visual card that still reflects the current project dataset.

**Architecture:** Extract the home overview poster content into a small utility so the featured cards and poster metrics come from the actual `spots` dataset instead of stale hardcoded copy. Then restyle the home summary card in `HomeOverview.vue` and `style.css` into a tourism-poster composition with atmosphere, data badges, and stronger hierarchy.

**Tech Stack:** Vue 3, TypeScript, Vitest, existing global CSS in `frontend/src/style.css`

---

### Task 1: Add a dataset-backed home overview model

**Files:**
- Create: `frontend/src/utils/home-overview.ts`
- Test: `frontend/tests/utils/home-overview.test.ts`

**Step 1: Write the failing test**

The test should expect:
- poster title `河南文旅数据`
- stats for `6` cities, `16` spots, `3` topic lines
- three featured cards with local `/images/spots/...` assets

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/home-overview.test.ts`
Expected: FAIL because `src/utils/home-overview.ts` does not exist.

**Step 3: Write minimal implementation**

Create a helper that:
- derives city count and topic count from `spots`
- returns poster copy and three featured cards
- keeps the output narrow and view-friendly

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/home-overview.test.ts`
Expected: PASS

### Task 2: Replace the home summary card with a poster composition

**Files:**
- Modify: `frontend/src/views/HomeOverview.vue`
- Modify: `frontend/src/style.css`

**Step 1: Update the view**

Use the new helper output in the home page and replace the old summary text block with:
- poster eyebrow
- headline and short tagline
- three data chips
- one small footer line

**Step 2: Style the poster card**

Adjust the existing `city-grid` and `summary-card` styles to create:
- layered gradient/image background
- larger display title
- compact metric pills
- subtle decorative frame and spotlight effects

**Step 3: Keep layout stable**

Ensure the poster card still aligns with the other three city cards and does not overflow or collapse at current desktop width.

### Task 3: Verify behavior

**Files:**
- Verify only

**Step 1: Run focused tests**

Run: `npm test -- tests/utils/home-overview.test.ts`

**Step 2: Run full suite**

Run: `npm test`

**Step 3: Run production build**

Run: `npm run build`

**Step 4: Review the home page visually**

Open the local preview and confirm:
- the home poster card feels like a tourism poster, not a plain stats card
- metrics match the current dataset
- surrounding city cards remain visually balanced
