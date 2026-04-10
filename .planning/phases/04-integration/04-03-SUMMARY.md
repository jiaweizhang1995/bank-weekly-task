---
phase: 04-integration
plan: 03
subsystem: infra
tags: [github-actions, pm2, ci-cd, ssh, deployment]

# Dependency graph
requires:
  - phase: 04-integration-01
    provides: Express static file serving and SPA fallback
  - phase: 04-integration-02
    provides: Frontend API integration replacing localStorage
provides:
  - GitHub Actions CI/CD workflow for auto-deploy to ECS on push to main
  - pm2 ecosystem config for production process management
  - End-to-end verified working application (frontend + backend + API)
affects: []

# Tech tracking
tech-stack:
  added: [github-actions, pm2, appleboy/ssh-action]
  patterns: [ci-cd-ssh-deploy, pm2-process-management]

key-files:
  created: [.github/workflows/deploy.yml, ecosystem.config.cjs]
  modified: []

key-decisions:
  - "appleboy/ssh-action@v1 for SSH deployment (widely used, simple config)"
  - "pm2 reload with fallback to start for zero-downtime deploys"
  - "256M max_memory_restart for pm2 to prevent memory leak issues"

patterns-established:
  - "CI/CD: push to main triggers deploy via SSH to ECS"
  - "Process management: pm2 ecosystem config at project root"

requirements-completed: [INFR-02]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 04 Plan 03: CI/CD Pipeline and End-to-End Verification Summary

**GitHub Actions SSH deploy to Alibaba Cloud ECS with pm2 process management, plus human-verified end-to-end app integration**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T00:45:00Z
- **Completed:** 2026-04-11T00:47:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- GitHub Actions workflow that deploys to ECS via SSH on push to main branch
- pm2 ecosystem config with autorestart and 256M memory limit
- End-to-end verification passed: HTML served, health API OK, members array returned, week object returned
- Human confirmed full app works in browser

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pm2 ecosystem config and GitHub Actions deploy workflow** - `ae70ff3` (chore)
2. **Task 2: Verify end-to-end integration works in browser** - checkpoint:human-verify (approved, no code changes)

## Files Created/Modified
- `.github/workflows/deploy.yml` - GitHub Actions CI/CD workflow using appleboy/ssh-action for SSH deploy
- `ecosystem.config.cjs` - pm2 process config for Express server (port 3000, autorestart, 256M memory limit)

## Decisions Made
- Used appleboy/ssh-action@v1 for SSH deployment (widely adopted, straightforward configuration)
- pm2 reload with fallback to start command for handling both fresh deploys and updates
- 256M max_memory_restart threshold appropriate for small team app

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

GitHub Secrets must be configured in the repository Settings before the CI/CD pipeline will work:
- `ECS_HOST` - Server IP address or hostname
- `ECS_USER` - SSH username (e.g., root)
- `ECS_SSH_KEY` - Private SSH key for authentication
- `ECS_PORT` - SSH port (optional, defaults to 22)

## Next Phase Readiness
- All Phase 04 plans complete - full integration achieved
- Application ready for deployment once GitHub Secrets are configured
- Server needs: Node.js, npm, pm2 installed, git clone of repo at /var/www/bank-weekly-task

## Self-Check: PASSED

- FOUND: .github/workflows/deploy.yml
- FOUND: ecosystem.config.cjs
- FOUND: ae70ff3 (Task 1 commit)

---
*Phase: 04-integration*
*Completed: 2026-04-11*
