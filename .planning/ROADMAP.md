# Roadmap: Bank Weekly Task Board

## Overview

The frontend is complete. This roadmap delivers the backend API that powers it — starting from an empty Express server, building auth and member management, adding all weekly task endpoints, and finishing with frontend integration so the app ships as a single deployable unit on Alibaba Cloud HK ECS.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Express server with JSON file persistence up and running
- [x] **Phase 2: Auth & Members** - Admin authentication and member management API
- [x] **Phase 3: Weekly API** - All weekly data, task, and status endpoints
- [ ] **Phase 4: Integration** - Frontend wired to API, single deployable unit ready

## Phase Details

### Phase 1: Foundation
**Goal**: A working Express server reads and writes data.json, ready for routes to be mounted
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01
**Success Criteria** (what must be TRUE):
  1. Running `node server.js` starts the server without errors
  2. data.json is created with default structure on first run if it does not exist
  3. Server reads existing data.json on restart without data loss
  4. A health-check request returns a 200 response confirming the server is alive
**Plans:** 1 plan
Plans:
- [x] 01-01-PLAN.md — Express server with JSON persistence and health check

### Phase 2: Auth & Members
**Goal**: Admin can authenticate with a PIN and receive a token; admin can manage team members via API
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, MEMB-01, MEMB-02, MEMB-03
**Success Criteria** (what must be TRUE):
  1. Admin POST /admin/login with correct PIN receives a token; wrong PIN receives 401
  2. Admin PUT /admin/pin with valid token updates the PIN; subsequent login uses new PIN
  3. Write endpoints reject requests missing or presenting invalid token with 401
  4. GET /members returns current member list without any token
  5. Admin can add a member (POST /members) and the member appears in subsequent GET /members
  6. Admin can delete a member (DELETE /members/{name}) and the member is gone from subsequent GET /members
**Plans:** 2 plans
Plans:
- [x] 02-01-PLAN.md — Auth middleware, admin login, and PIN change endpoints
- [x] 02-02-PLAN.md — Member CRUD endpoints (list, add, delete)

### Phase 3: Weekly API
**Goal**: All weekly data endpoints work — members can view tasks and mark completion, admin can manage tasks and settings
**Depends on**: Phase 2
**Requirements**: WEEK-01, WEEK-02, WEEK-03, WEEK-04, WEEK-05, WEEK-06, STAT-01, STAT-02, STAT-03
**Success Criteria** (what must be TRUE):
  1. GET /week returns complete week object — announcement, deadline, penalty, all tasks, all member statuses — in one response
  2. Admin can update announcement (PUT /week/announcement) and GET /week reflects the new text
  3. Admin can update deadline and penalty (PUT /week/settings) and GET /week reflects new values
  4. Admin can add a task (POST /week/tasks) and delete it (DELETE /week/tasks/{taskId}); GET /week reflects changes
  5. Member can mark own task done (PUT /week/tasks/{taskId}/status/{member} with status=done); admin can reject (status=rejected) or reset (status=null)
  6. Admin POST /week/reset returns all task statuses to null and clears announcement/settings to defaults
**Plans:** 2 plans
Plans:
- [x] 03-01-PLAN.md — Week data read, announcement, and settings endpoints
- [x] 03-02-PLAN.md — Task CRUD, status management, and week reset endpoints

### Phase 4: Integration
**Goal**: Express serves the built frontend as static files, frontend uses the API instead of localStorage, GitHub Actions CI/CD auto-deploys to Alibaba Cloud HK ECS — one server, one URL, fully working app
**Depends on**: Phase 3
**Requirements**: INFR-02, INFR-03
**Success Criteria** (what must be TRUE):
  1. Visiting the server URL in a browser loads the React app without a separate dev server
  2. Selecting a member name and marking a task done persists after a browser refresh (data comes from API, not localStorage)
  3. Admin login, task management, and weekly reset all work end-to-end through the API in the browser
  4. Pushing to main branch triggers GitHub Actions workflow that SSH deploys to ECS, pulls code, installs deps, builds frontend, and restarts pm2 process
  5. After a push-triggered deploy, the live site reflects the new code without manual SSH
**Plans:** 3 plans
Plans:
- [x] 04-01-PLAN.md — Express serves Vite-built frontend as static files with SPA fallback
- [x] 04-02-PLAN.md — Refactor frontend from localStorage to API calls
- [ ] 04-03-PLAN.md — GitHub Actions CI/CD pipeline and end-to-end verification
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | ✓ Complete | 2026-04-10 |
| 2. Auth & Members | 2/2 | ✓ Complete | 2026-04-10 |
| 3. Weekly API | 2/2 | ✓ Complete | 2026-04-10 |
| 4. Integration | 0/3 | Not started | - |
