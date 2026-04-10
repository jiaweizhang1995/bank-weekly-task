# Bank Weekly Task Board

## What This Is

A lightweight weekly task board system for a small team (1 admin + several members). The admin publishes weekly announcements and tasks, members self-mark completion, and the admin can review and reject. Everyone accesses through the same H5 link, identifying by name selection. Admin panel is PIN-protected. The frontend (React 19 + Vite) is already built; this project adds the backend API.

## Core Value

Members can see their weekly tasks and mark them done, and the admin can manage everything from one simple interface — no accounts, no complexity.

## Requirements

### Validated

- ✓ Landing page with member selection — existing frontend
- ✓ Member view with task list and completion marking — existing frontend
- ✓ Admin login with PIN — existing frontend
- ✓ Admin panel: manage members, tasks, announcements, settings — existing frontend
- ✓ Status board showing all members' completion — existing frontend
- ✓ Weekly reset functionality — existing frontend
- ✓ OKLCH design system with Chinese UI — existing frontend

### Active

- [ ] Backend API server (Node.js + Express)
- [ ] JSON file-based data persistence
- [ ] Member management endpoints (GET/POST/DELETE /members)
- [ ] Weekly data endpoint (GET /week) returning complete week structure
- [ ] Announcement management (PUT /week/announcement)
- [ ] Settings management (PUT /week/settings — deadline, penalty)
- [ ] Task CRUD (POST/DELETE /week/tasks)
- [ ] Task status updates with role-based logic (PUT /week/tasks/{taskId}/status/{member})
- [ ] Weekly reset endpoint (POST /week/reset)
- [ ] Admin PIN authentication with token (POST /admin/login)
- [ ] Admin PIN change (PUT /admin/pin)
- [ ] Role-based access: admin via token, members via name parameter
- [ ] Express serves built frontend static files (same server deployment)
- [ ] CORS configured for same-origin serving

### Out of Scope

- User accounts / registration — identity is just name selection, no login system
- Historical data / archives — each week resets cleanly
- Pagination — data set is tiny (5-10 people, 3-5 tasks)
- Database (SQL/NoSQL) — JSON file is sufficient for this scale
- Cloudflare Workers deployment — deploying to Alibaba Cloud HK ECS instead
- Real-time updates (WebSocket) — polling or manual refresh is fine for this team size
- Mobile app — H5 web access only

## Context

- Frontend is complete: single-file React 19 SPA (`task-board.jsx`, ~1059 lines) with localStorage persistence
- Current data model: `{ adminPin, members[], currentWeek: { tasks[], status{}, deadline, penalty, announcement } }`
- Frontend currently uses `window.storage` (localStorage wrapper in `src/main.jsx`) — needs to be replaced with API calls
- Default admin PIN is "8888" — will move to backend
- All UI text is in Chinese (zh-CN)
- Team size: 5-10 members, 3-5 tasks per week
- Frontend uses Vite for build; production bundle can be served by Express as static files

## Constraints

- **Tech stack**: Node.js + Express — same language as frontend for simplicity
- **Storage**: JSON file on disk — no database dependencies, fits the tiny data set
- **Deployment**: Alibaba Cloud Hong Kong ECS — frontend and backend on same server
- **Serving**: Express serves Vite-built static files + API routes on same port
- **Auth**: Simple PIN → token for admin; name parameter for members (no user auth system)
- **Scale**: 5-10 users, not designed for growth beyond small team

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Express + JSON file over database | Data is tiny, no relations needed, simplest possible persistence | — Pending |
| Same-server deployment (frontend + backend) | Avoids CORS complexity, single deployment target | — Pending |
| Token-based admin auth (not session) | Stateless, simple to implement with Express | — Pending |
| Members identified by name, no auth | Team is small and trusted, no need for accounts | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-10 after initialization*
