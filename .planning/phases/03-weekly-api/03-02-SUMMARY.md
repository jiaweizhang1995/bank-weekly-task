---
phase: 03-weekly-api
plan: 02
subsystem: api
tags: [express, rest, task-crud, status-tracking, week-reset]

# Dependency graph
requires:
  - phase: 03-weekly-api-01
    provides: "GET /api/week, PUT /announcement, PUT /settings endpoints, DEFAULT_WEEK pattern"
  - phase: 02-auth-members
    provides: "requireAdmin middleware, verifyToken function, getData/saveData store"
provides:
  - "POST /api/week/tasks admin endpoint for task creation"
  - "DELETE /api/week/tasks/:taskId admin endpoint for task removal with status cleanup"
  - "PUT /api/week/tasks/:taskId/status/:member conditional-auth endpoint for status updates"
  - "POST /api/week/reset admin endpoint for weekly data reset"
affects: [04-static-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns: [conditional auth per status value, status cleanup on task delete]

key-files:
  created: []
  modified: [routes/week.js, routes/week.test.js]

key-decisions:
  - "verifyToken imported for manual auth check in status endpoint (done=public, rejected/null=admin)"
  - "Status cleanup on task delete prevents orphaned status entries"

patterns-established:
  - "Conditional auth: status value determines auth requirement (done=no token, rejected/null=admin token)"
  - "Status cleanup: deleting a task removes its ID from all member status objects"

requirements-completed: [WEEK-04, WEEK-05, WEEK-06, STAT-01, STAT-02, STAT-03]

# Metrics
duration: 3min
completed: 2026-04-10
---

# Phase 03 Plan 02: Task CRUD, Status & Reset Summary

**Task CRUD with admin auth, conditional-auth status updates (member self-mark done, admin reject/reset), and week reset endpoint**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-10T16:15:02Z
- **Completed:** 2026-04-10T16:17:40Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- POST /api/week/tasks creates tasks with server-generated ID (admin auth required)
- DELETE /api/week/tasks/:taskId removes tasks and cleans up all member status entries
- PUT /api/week/tasks/:taskId/status/:member with conditional auth: "done" works without token (member self-mark), "rejected" and null require admin token
- POST /api/week/reset clears all weekly data to empty defaults
- 27 week route tests (17 new + 10 existing), 51 total across full suite, all passing

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add failing tests for task CRUD and status** - `d6c7c77` (test)
2. **Task 1 GREEN: Implement task CRUD and status endpoints** - `d8ebe64` (feat)
3. **Task 2: Add week reset endpoint with full test suite** - `06df53d` (feat)

## Files Created/Modified
- `routes/week.js` - Added POST /tasks, DELETE /tasks/:taskId, PUT /tasks/:taskId/status/:member, POST /reset endpoints
- `routes/week.test.js` - Added 17 new test cases for task CRUD, status management, and week reset

## Decisions Made
- Imported verifyToken from middleware/auth.js for manual auth check in status endpoint (only "done" is public, "rejected" and null require admin token per STAT-01/STAT-02/STAT-03)
- Status cleanup on task delete removes the taskId from every member's status object to prevent orphaned entries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 9 weekly API requirements complete (WEEK-01 through WEEK-06, STAT-01 through STAT-03)
- Full API surface ready for frontend integration
- 51 tests across 4 test files provide regression safety
- Ready for Phase 04: static file serving and deployment

---
*Phase: 03-weekly-api*
*Completed: 2026-04-10*

## Self-Check: PASSED
