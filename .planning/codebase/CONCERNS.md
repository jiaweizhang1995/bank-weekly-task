# Codebase Concerns

**Analysis Date:** 2026-04-10

## Security Concerns

**Hardcoded Admin PIN:**
- Issue: Default admin password "8888" is hardcoded in the application
- Files: `task-board.jsx` (line 6)
- Impact: Everyone who views the source code or accesses the app can access admin features. No protection against brute force attacks
- Fix approach: Move PIN to environment variable or secure configuration. Implement rate limiting for PIN attempts. Consider hashing the PIN for local storage

**No Password Validation on PIN Change:**
- Issue: PIN can be changed to any string >= 4 characters without strength validation
- Files: `task-board.jsx` (line 549-555)
- Impact: Users can set weak PINs like "1111" or "0000". No confirmation required before changing
- Fix approach: Add PIN strength requirements (mixed alphanumeric), require current PIN confirmation, add visual feedback

**Browser Storage Vulnerability:**
- Issue: All data including admin PIN is stored in plaintext in localStorage
- Files: `src/main.jsx` (line 7-15), `task-board.jsx` (line 68, 80)
- Impact: Anyone with access to browser dev tools or localStorage can read sensitive data including the admin PIN and all task data
- Fix approach: Encrypt sensitive data before storage, consider using sessionStorage for temporary data, never store admin PIN

**Missing Input Validation & XSS Risk:**
- Issue: No sanitization or validation of user inputs (task names, descriptions, member names, announcements)
- Files: `task-board.jsx` (lines 504-510, 539-543, 600-603, 608-609)
- Impact: Malicious input could break UI or enable XSS if data is ever displayed in other contexts. No protection against injection attacks
- Fix approach: Validate input length and format, sanitize before rendering, implement whitelist validation for member names

**CORS/Cross-Origin Data Access:**
- Issue: window.storage API polyfill assumes localStorage without origin verification
- Files: `src/main.jsx` (line 7-15)
- Impact: If this app is embedded in iframes or accessed from different origins, localStorage boundaries could be violated
- Fix approach: Add origin verification, consider using sessionStorage, implement proper CORS headers

## Tech Debt

**1059-Line Monolithic Component:**
- Issue: Entire application (1059 lines) is in a single JSX file with multiple components defined in same file
- Files: `task-board.jsx`
- Impact: Difficult to test individual components, impossible to reuse, high cognitive load, poor maintainability, slow IDE performance
- Fix approach: Split into separate files: App.jsx, Landing.jsx, AdminView.jsx, MemberView.jsx, and shared/components directory

**No Error Boundaries:**
- Issue: No error boundary components to catch rendering errors
- Files: `task-board.jsx`
- Impact: Single component error crashes entire application. Users see blank screen. No recovery mechanism
- Fix approach: Implement ErrorBoundary wrapper component, add try-catch blocks in render paths

**Inconsistent Error Handling:**
- Issue: Storage load errors are caught and silently default (line 70-71), but save errors only log to console (line 82)
- Files: `task-board.jsx` (lines 70-82)
- Impact: Users don't know if saves failed. Data loss could occur silently. Asymmetric error handling across app
- Fix approach: Show user-facing error toast/notification on save failure, implement retry mechanism

**No Type Safety:**
- Issue: Written in JSX without TypeScript, no prop validation
- Files: All component files
- Impact: Runtime errors from prop mismatches, IDE can't catch bugs, refactoring is risky, documentation is poor
- Fix approach: Migrate to TypeScript, add PropTypes as interim solution

**Unmanaged Global Style State:**
- Issue: Inline styles throughout component (600+ style objects), no CSS-in-JS solution or design system
- Files: `task-board.jsx`
- Impact: Colors and spacing hardcoded everywhere making theming impossible, no theme consistency, style changes require editing 100+ locations
- Fix approach: Extract to CSS modules or styled-components, create design token system

**Missing Dependency in useEffect:**
- Issue: useEffect at line 65-75 has empty dependency array but initializes from data, useCallback at line 77 has empty deps
- Files: `task-board.jsx` (lines 65, 77)
- Impact: Hook dependencies are incomplete, potential for stale closures
- Fix approach: Add proper dependency arrays or convert to useReducer

## Performance Bottlenecks

**Countdown Timer Inefficiency:**
- Issue: CountDown component updates every 60 seconds via setInterval, all instances share same interval
- Files: `task-board.jsx` (lines 454-475)
- Impact: Multiple countdowns on landing page cause multiple interval updates, wasted CPU cycles
- Fix approach: Use a single global timer context or custom hook, implement proper cleanup

**Large Status Tables Without Virtualization:**
- Issue: Status tables render all rows/columns even if not visible (lines 373-406, 649-678)
- Files: `task-board.jsx`
- Impact: Large teams (50+ members × 20+ tasks) cause DOM bloat and slow rendering
- Fix approach: Implement virtual scrolling or pagination for status tables

**All Data in Single State Object:**
- Issue: Any state change serializes and saves entire 1059-line data structure to localStorage
- Files: `task-board.jsx` (lines 77-84)
- Impact: Toggling a single checkbox serializes 100KB+ object, network overhead, slower save operations
- Fix approach: Split state by concern, implement differential saves, use database instead of localStorage

**Missing Memoization:**
- Issue: Landing, AdminView, MemberView, StatusBoard components re-render on any parent update without React.memo
- Files: `task-board.jsx`
- Impact: Entire app re-renders when any state changes, unnecessary DOM updates
- Fix approach: Wrap components with React.memo, refactor to separate context for different views

## Fragile Areas

**Status Data Structure Fragility:**
- Issue: Status stored as nested objects `status[memberName][taskId]` with no schema validation
- Files: `task-board.jsx` (lines 394-395, 529-536)
- Impact: Missing member cleanup causes orphaned status entries, missing task cleanup leaves status properties that break renders, no type safety
- Fix approach: Use structured data with cleanup on member/task deletion, validate shape on load

**Task/Member Deletion Without Cascade:**
- Issue: Removing a member cleans status (line 546), but removing a task requires manual status cleanup (line 512-523)
- Files: `task-board.jsx` (lines 512-523, 545-547)
- Impact: Inconsistent cleanup patterns, easy to forget cascade logic, data accumulation over time
- Fix approach: Centralize deletion logic, implement proper cascade rules

**Date/Time Handling:**
- Issue: Uses Date.now() and new Date(deadline).getTime() inconsistently, no timezone handling
- Files: `task-board.jsx` (lines 455-475, 330-331, 778)
- Impact: Countdown shows wrong remaining time across timezones, deadline display is locale-dependent
- Fix approach: Use ISO 8601 strings, implement timezone-aware formatting

**Storage Polyfill Assumption:**
- Issue: App assumes window.storage API exists, but it's only created in main.jsx
- Files: `task-board.jsx` (lines 68, 80), `src/main.jsx` (lines 7-15)
- Impact: If App is imported before polyfill is set up, storage calls fail. Race condition possible
- Fix approach: Make storage initialization async, validate API availability, throw meaningful error if missing

## Testing Coverage Gaps

**No Test Files:**
- What's not tested: Entire application has zero tests
- Files: No test directory or test files found
- Risk: Component logic untested (filtering, status toggling, data persistence), UI behavior unverified, regressions undetected
- Priority: High - Add unit tests for core logic (status toggling, task filtering, week reset)

**No E2E Tests:**
- What's not tested: Full user workflows (login → view tasks → mark done → submit), admin operations
- Files: No e2e test setup found
- Risk: Critical workflows like password change, member deletion could silently break
- Priority: High - Add E2E tests for admin and member flows

**UI Edge Cases Untested:**
- What's not tested: Countdown edge cases, table rendering with 0/100+ tasks, long text wrapping, mobile responsiveness
- Files: All UI components in `task-board.jsx`
- Risk: App could break on real-world data sizes, mobile users experience broken layout
- Priority: Medium - Test with realistic data volumes

## Missing Critical Features

**No Data Backup:**
- Problem: Single source of truth is localStorage. No backup or export mechanism
- Blocks: Data recovery if browser data is cleared, migration to different device, audit trail
- Fix approach: Add export to JSON feature, implement cloud sync option

**No Audit Log:**
- Problem: No tracking of who changed what or when
- Blocks: Cannot debug why status changed, no accountability for admin actions, hard to investigate issues
- Fix approach: Add change log with timestamps and member info

**No Validation on Week Reset:**
- Problem: "Clear all tasks" button has no confirmation dialog
- Blocks: Accidental data loss, no undo mechanism
- Fix approach: Add confirmation modal, implement undo/restore functionality

**No Offline Support:**
- Problem: App requires localStorage but no service worker or offline fallback
- Blocks: Cannot use app offline, no conflict resolution for simultaneous edits
- Fix approach: Add service worker, implement sync queue for offline changes

## Scaling Limits

**Local Storage Limit:**
- Current capacity: Typically 5-10MB per origin
- Limit: App will break when task history + status data exceeds browser limit
- Scaling path: Implement data archival (move completed weeks to export), consider IndexedDB for larger storage, migrate to server-side database

**No Concurrency Control:**
- Current capacity: Single browser instance only
- Limit: Multiple team members cannot edit simultaneously without conflicts
- Scaling path: Implement server backend with conflict resolution, use operational transformation or CRDT

**No Real-Time Sync:**
- Current capacity: Manual page refresh required to see updates from other users
- Limit: Team coordination breaks if not everyone refreshes constantly
- Scaling path: Add WebSocket for real-time updates, implement server-sent events

## Dependencies at Risk

**React 19.1.0 (very new):**
- Risk: Major version released recently, may have undiscovered bugs
- Impact: Stability not proven in production, limited community patterns
- Migration plan: Lock to stable 18.3.x until React 19 has 6+ months production use

**Vite 6.3.2 (development):**
- Risk: Early version of Vite 6, minimal community feedback
- Impact: Build process could have undiscovered issues, documentation may be incomplete
- Migration plan: Consider locking to Vite 5.x for stability

**No Dev Tools:**
- Risk: No linter (ESLint), no formatter (Prettier), no test framework
- Impact: Code quality issues go undetected, formatting inconsistent, no CI/CD pipeline possible
- Migration plan: Add ESLint + Prettier, set up vitest or Jest for testing

---

*Concerns audit: 2026-04-10*
