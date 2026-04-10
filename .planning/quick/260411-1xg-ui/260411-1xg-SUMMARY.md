---
phase: quick
plan: 260411-1xg
subsystem: frontend-ui
tags: [ui-polish, chinese-locale, task-board]
key-files:
  modified:
    - task-board.jsx
decisions:
  - "CountDown uses Math.ceil for days to always round up partial days"
metrics:
  duration: "2min"
  completed: "2026-04-11"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Quick Task 260411-1xg: UI Polish Changes Summary

Five UI improvements to task-board.jsx for better readability: Chinese date in landing header, real task names in status table, penalty prefix label, day-based countdown, and dedicated announcement save button.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Date display, task names, penalty prefix, countdown in days | d75ae2b | task-board.jsx |
| 2 | Add separate save button for weekly announcement | 2a760ff | task-board.jsx |

## Changes Made

### Task 1: Four UI changes
- **Landing header date**: Added formatted Chinese date paragraph (e.g., "2026年4月11日 星期六") below "选择你的名字进入"
- **Status table headers**: Changed from generic "任务1", "任务2" to actual task names with ellipsis truncation (maxWidth: 80)
- **Penalty prefix**: Added "惩罚：" prefix in both StatusBoard (line ~341) and MemberView (line ~818)
- **CountDown component**: Replaced hours/minutes (`{hours}h {mins}m`) with days (`{days}天`) using `Math.ceil(diff / 86400000)`

### Task 2: Announcement save button
- Added "保存通知" button with warning color below the announcement textarea in admin tasks tab
- Calls `api.updateAnnouncement(announcement)` independently from the deadline/penalty publish flow
- Shows alert "通知已保存" on success

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npm run build` completes successfully (built in 439ms)
- All 5 UI changes applied to task-board.jsx

## Self-Check: PASSED
