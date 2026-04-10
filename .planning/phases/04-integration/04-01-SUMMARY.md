---
phase: 04-integration
plan: 01
subsystem: infra
tags: [express, vite, static-serving, spa]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Express server with API routes
  - phase: 03-weekly-api
    provides: All API endpoints mounted on server.js
provides:
  - Express serves Vite-built React frontend from dist/
  - SPA fallback for client-side routing
  - Single-server deployment (API + frontend on one port)
affects: [04-02, 04-03, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: [express-static-serving, spa-fallback, express5-named-wildcard]

key-files:
  created: []
  modified: [server.js, package.json]

key-decisions:
  - "Used Express 5 named wildcard syntax /{*splat} instead of bare * for SPA fallback (Express 5 path-to-regexp v8 requirement)"

patterns-established:
  - "Static files served BEFORE API routes, SPA fallback AFTER API routes"
  - "Express 5 wildcard routes use /{*splat} syntax not bare *"

requirements-completed: [INFR-02]

# Metrics
duration: 1min
completed: 2026-04-11
---

# Phase 04 Plan 01: Static File Serving Summary

**Express serves Vite-built React frontend with SPA fallback using Express 5 named wildcard routing**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-10T16:39:38Z
- **Completed:** 2026-04-10T16:40:43Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Express serves the Vite-built dist/ directory as static files alongside API routes
- SPA fallback returns index.html for any non-API GET request, supporting client-side routing
- Added preview script for build+serve workflow in package.json
- All existing API tests pass unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Build frontend and configure Express to serve static files with SPA fallback** - `246e5a5` (feat)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified
- `server.js` - Added express.static for dist/, SPA fallback with /{*splat}, node:url/path imports for __dirname
- `package.json` - Added preview script

## Decisions Made
- Used Express 5 named wildcard syntax `/{*splat}` instead of bare `*` for SPA fallback route. Express 5 uses path-to-regexp v8 which requires named parameters for wildcards.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Express 5 wildcard syntax incompatibility**
- **Found during:** Task 1 (SPA fallback route)
- **Issue:** Plan specified `app.get('*', ...)` but Express 5 (path-to-regexp v8) throws PathError on bare `*` wildcard
- **Fix:** Changed to `app.get('/{*splat}', ...)` which is the Express 5 named wildcard syntax
- **Files modified:** server.js
- **Verification:** Server starts, SPA fallback returns index.html for non-API routes
- **Committed in:** 246e5a5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for Express 5 compatibility. No scope creep.

## Issues Encountered
None beyond the deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Static serving is complete, ready for CORS configuration (04-02)
- Frontend API wiring (04-03) can proceed since server now serves both frontend and API

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 04-integration*
*Completed: 2026-04-11*
