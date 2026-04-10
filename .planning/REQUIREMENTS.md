# Requirements: Bank Weekly Task Board

**Defined:** 2026-04-10
**Core Value:** Members can see their weekly tasks and mark them done, and the admin can manage everything from one simple interface

## v1 Requirements

### Member Management

- [ ] **MEMB-01**: API returns list of all team members (GET /members)
- [ ] **MEMB-02**: Admin can add a new member by name (POST /members)
- [ ] **MEMB-03**: Admin can delete a member by name (DELETE /members/{name})

### Weekly Data

- [ ] **WEEK-01**: API returns complete weekly data in one response — announcement, tasks, deadline, penalty, all members' status (GET /week)
- [ ] **WEEK-02**: Admin can update the weekly announcement (PUT /week/announcement)
- [ ] **WEEK-03**: Admin can update deadline and penalty settings (PUT /week/settings)
- [ ] **WEEK-04**: Admin can add a new task with name and description (POST /week/tasks)
- [ ] **WEEK-05**: Admin can delete a task by ID (DELETE /week/tasks/{taskId})
- [ ] **WEEK-06**: Admin can reset all weekly data to start a new week (POST /week/reset)

### Task Status

- [ ] **STAT-01**: Member can mark their own task as done (PUT /week/tasks/{taskId}/status/{member}, status=done)
- [ ] **STAT-02**: Admin can reject a member's completion (status=rejected)
- [ ] **STAT-03**: Admin can reset a member's task status back to null

### Authentication

- [ ] **AUTH-01**: Admin can log in with PIN and receive a token (POST /admin/login)
- [ ] **AUTH-02**: Admin can change the PIN while authenticated (PUT /admin/pin)
- [ ] **AUTH-03**: All write endpoints for admin require valid token
- [ ] **AUTH-04**: Member write endpoints only require name parameter (no auth)

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
| MEMB-01 | Pending | Pending |
| MEMB-02 | Pending | Pending |
| MEMB-03 | Pending | Pending |
| WEEK-01 | Pending | Pending |
| WEEK-02 | Pending | Pending |
| WEEK-03 | Pending | Pending |
| WEEK-04 | Pending | Pending |
| WEEK-05 | Pending | Pending |
| WEEK-06 | Pending | Pending |
| STAT-01 | Pending | Pending |
| STAT-02 | Pending | Pending |
| STAT-03 | Pending | Pending |
| AUTH-01 | Pending | Pending |
| AUTH-02 | Pending | Pending |
| AUTH-03 | Pending | Pending |
| AUTH-04 | Pending | Pending |
| INFR-01 | Pending | Pending |
| INFR-02 | Pending | Pending |
| INFR-03 | Pending | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-10 after initial definition*
