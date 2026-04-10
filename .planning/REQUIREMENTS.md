# Requirements: Bank Weekly Task Board

**Defined:** 2026-04-10
**Core Value:** Members can see their weekly tasks and mark them done, and the admin can manage everything from one simple interface

## v1 Requirements

### Member Management

- [x] **MEMB-01**: API returns list of all team members (GET /members)
- [x] **MEMB-02**: Admin can add a new member by name (POST /members)
- [x] **MEMB-03**: Admin can delete a member by name (DELETE /members/{name})

### Weekly Data

- [x] **WEEK-01**: API returns complete weekly data in one response — announcement, tasks, deadline, penalty, all members' status (GET /week)
- [x] **WEEK-02**: Admin can update the weekly announcement (PUT /week/announcement)
- [x] **WEEK-03**: Admin can update deadline and penalty settings (PUT /week/settings)
- [x] **WEEK-04**: Admin can add a new task with name and description (POST /week/tasks)
- [x] **WEEK-05**: Admin can delete a task by ID (DELETE /week/tasks/{taskId})
- [x] **WEEK-06**: Admin can reset all weekly data to start a new week (POST /week/reset)

### Task Status

- [x] **STAT-01**: Member can mark their own task as done (PUT /week/tasks/{taskId}/status/{member}, status=done)
- [x] **STAT-02**: Admin can reject a member's completion (status=rejected)
- [x] **STAT-03**: Admin can reset a member's task status back to null

### Authentication

- [x] **AUTH-01**: Admin can log in with PIN and receive a token (POST /admin/login)
- [x] **AUTH-02**: Admin can change the PIN while authenticated (PUT /admin/pin)
- [x] **AUTH-03**: All write endpoints for admin require valid token
- [x] **AUTH-04**: Member write endpoints only require name parameter (no auth)

### Infrastructure

- [ ] **INFR-01**: Express server with JSON file persistence (read/write data.json)
- [ ] **INFR-02**: Express serves Vite-built frontend as static files
- [ ] **INFR-03**: Frontend refactored from localStorage to API calls

## v2 Requirements

### Enhancements

- **ENH-01**: Deadline countdown with automatic status changes
- **ENH-02**: Task completion statistics and history
- **ENH-03**: Email/WeChat notification for new tasks
- **ENH-04**: Multiple admin support

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / registration | Identity is name selection, team is small and trusted |
| Historical data / archives | Weekly reset by design, no history needed |
| Database (SQL/NoSQL) | JSON file sufficient for 5-10 people, 3-5 tasks |
| Pagination | Data set is tiny, single response covers everything |
| Cloudflare Workers | Deploying to Alibaba Cloud HK ECS instead |
| Real-time updates (WebSocket) | Manual refresh sufficient for team size |
| Mobile app | H5 web access only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| MEMB-01 | Phase 2 | Complete |
| MEMB-02 | Phase 2 | Complete |
| MEMB-03 | Phase 2 | Complete |
| WEEK-01 | Phase 3 | Complete |
| WEEK-02 | Phase 3 | Complete |
| WEEK-03 | Phase 3 | Complete |
| WEEK-04 | Phase 3 | Complete |
| WEEK-05 | Phase 3 | Complete |
| WEEK-06 | Phase 3 | Complete |
| STAT-01 | Phase 3 | Complete |
| STAT-02 | Phase 3 | Complete |
| STAT-03 | Phase 3 | Complete |
| INFR-02 | Phase 4 | Pending |
| INFR-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-10 after roadmap creation — all 19 requirements mapped*
