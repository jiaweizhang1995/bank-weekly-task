---
status: partial
phase: 04-integration
source: [04-VERIFICATION.md]
started: 2026-04-11T12:00:00Z
updated: 2026-04-11T12:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Data persistence across browser refresh
expected: Select a member, mark a task done, refresh the browser — the task status persists (data from API, not localStorage)
result: [pending]

### 2. Full admin workflow in browser
expected: Login with PIN 8888, add/delete tasks, manage members, toggle statuses, update announcement, reset week — all operations succeed and UI reflects changes immediately
result: [pending]

### 3. GitHub Actions deploy trigger
expected: Push a commit to main with secrets configured (ECS_HOST, ECS_USER, ECS_SSH_KEY) — workflow triggers, SSHs to ECS, deploys code
result: [pending]

### 4. Live site post-deploy
expected: After push-triggered deploy completes, visit the ECS URL — live site reflects the new code
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
