---
phase: quick-260411-d9t
plan: 01
subsystem: landing-header
tags: [ui, layout, header, menu]
requires: []
provides:
  - landing-header-flex-row
affects:
  - task-board.jsx
tech-stack:
  added: []
  patterns:
    - inline-flex-row-header
key-files:
  created: []
  modified:
    - task-board.jsx
decisions:
  - "Landing header ☰ menu moved from absolute top/right to a flex row sibling of h1 so it vertically centers on the dominant title; menu wrapper uses position:relative + flexShrink:0 to keep the dropdown panel anchored and prevent shrinking when h1 wraps."
metrics:
  duration: "~3min"
  completed: "2026-04-11"
  tasks_completed: 1
  files_touched: 1
---

# Quick 260411-d9t: Align ☰ Menu with Landing Header Title Summary

Vertically centered the Landing view ☰ menu button with the h1 "周工作看板" title by wrapping the two in a flex row, replacing the previous absolute top/right positioning that aligned the button with the small "平安银行顶私顾问" subtitle.

## Scope

- Target: Landing view header block in `task-board.jsx` (was ~lines 354–453).
- Out of scope (untouched): separate `Header` component, `s` style object, color tokens, Member/Admin/StatusBoard views, `src/main.jsx`, `src/index.css`, `vite.config.js`.

## Changes

### Task 1: Restructure Landing header into flex row

**File:** `task-board.jsx`
**Commit:** `d2546c9`

Reordered the header children to: subtitle → flex row (h1 + menu wrapper) → date.

- Removed `position: "relative"` from the outer header padding div (no longer needed).
- Removed the absolutely-positioned menu wrapper (`position: absolute, top: 20, right: 20`).
- Introduced a new flex row container (`display: flex, alignItems: center, justifyContent: space-between, gap: 16`) holding:
  - The existing h1 `周工作看板` with all its original typography styles intact.
  - The menu wrapper now using `position: relative` + `flexShrink: 0`, still carrying `data-html2canvas-ignore="true"`.
- Preserved the ☰ `<button>`, `menuOpen` conditional (backdrop + panel), and both menu items (`管理后台`, `导出为长图`) exactly as they were — same handlers, aria labels, disabled logic, hover background swaps, and the panel offset `{ top: 52, right: 0 }`.
- Subtitle `<p>平安银行顶私顾问</p>` kept as first child; date `<p>` kept as last child.

## Verification

### Automated

- Intent check of the Landing header block (anchored at `ref={captureRef}`) confirms:
  - `justifyContent`, `alignItems`, `data-html2canvas-ignore`, `top: 52` all present.
  - Old `top: 20` + `right: 20` pair no longer present in the block.
- `npm run build` — succeeded, 31 modules transformed, no syntax errors, `dist/assets/index-*.js` 461 kB.

### Manual verification expected (per plan success criteria)

- Landing page: ☰ sits vertically centered with `周工作看板`, not floating up beside the subtitle.
- Clicking ☰ opens dropdown panel just below the button, anchored to its right edge (`top: 52, right: 0`).
- `管理后台` still opens admin login flow.
- `导出为长图` still runs existing export; generated long image still excludes the ☰ button (html2canvas-pro ignores elements with `data-html2canvas-ignore`).
- Narrow viewport (~360px): h1 stays left, ☰ stays right without shrinking (guaranteed by `flexShrink: 0`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan's automated verify anchor was incorrect**
- **Found during:** Task 1 verification
- **Issue:** The plan's automated check uses `src.indexOf('captureRef')`, which matches the first occurrence — the `useBoardExport({ captureRef, ... })` parameter declaration near line 61 — not the JSX `<div ref={captureRef}>` on line 354. The 3500-char block starting at the hook declaration does not contain any of the Landing header markers, so the script would fail no matter what the header looked like.
- **Fix:** Ran the equivalent check anchored on `ref={captureRef}` (the JSX attribute) to validate intent against the correct block. All five conditions in the script pass against the restructured header. No source code changed for this fix — the code matches the plan exactly; only the verification anchor needed correction to observe the truth.
- **Files modified:** none (verification-script anchor correction only)
- **Commit:** n/a

## Key Decisions

- Dropped `position: "relative"` from the outer header padding div since the menu wrapper no longer needs it as an absolute positioning context — the wrapper is now the relative anchor for its own dropdown.
- Kept every child of the menu wrapper byte-identical (except for indentation added by nesting one level deeper inside the new flex row) to minimize risk to the html2canvas export and admin entry flow shipped in Quick 260411-2hv.

## Self-Check: PASSED

- File exists: `task-board.jsx` (modified) — FOUND
- Commit exists: `d2546c9` — FOUND
- Plan success criteria: all met (flex-row structure, menu wrapper relative + ignored, panel anchor preserved, build green).
