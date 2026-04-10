# Testing Patterns

**Analysis Date:** 2026-04-10

## Test Framework

**Runner:**
- Not configured

**Assertion Library:**
- Not configured

**Run Commands:**
- No test scripts in `package.json`

**Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

## Test File Organization

**Status:**
- No test files found in codebase
- No `.test.js`, `.spec.js`, `.test.jsx`, or `.spec.jsx` files present
- No test directory (`__tests__`, `tests`, `test`)

**Testing Framework Integration:**
- No testing dependencies in `package.json`:
  - Jest absent
  - Vitest absent
  - Mocha absent
  - React Testing Library absent
  - Cypress absent

## Manual Testing Approach

**Current State:**
- Application tested manually via browser only
- No automated test coverage
- Test verification through UI interaction in `src/main.jsx` and `task-board.jsx`

## Testable Components

**Components without tests:**
- `App` component (`task-board.jsx` line 57): Main app orchestrator with view state management
- `Landing` component (`task-board.jsx` line 157): Member selection and status display
- `AdminView` component (`task-board.jsx` line 478): Task management and admin controls
- `MemberView` component (`task-board.jsx` line 736): Individual member task view
- `StatusBoard` component (`task-board.jsx` line 294): Status table and announcement display
- `Header` component (`task-board.jsx` line 894): Shared header with back navigation
- `SectionHeading` component (`task-board.jsx` line 928): Shared section title component
- `StatusDot` component (`task-board.jsx` line 413): Task status indicator
- `CountDown` component (`task-board.jsx` line 455): Deadline countdown timer
- `LoadingScreen` component (`task-board.jsx` line 941): Loading placeholder
- `FontLoader` component (`task-board.jsx` line 48): Google Fonts stylesheet injector

## Business Logic to Test

**Data Operations:**
- Task creation: `addTask()` function (lines 503-510)
  - Input validation: non-empty task name required
  - Data immutability: spreads existing tasks
  - Side effect: triggers `saveData()`

- Task deletion: `removeTask(id)` function (lines 512-523)
  - Removes task by id from week.tasks
  - Removes all status entries for that task across members
  - Data structure consistency

- Member status toggling: `toggleStatus(member, taskId)` function (lines 529-537)
  - Three-state cycle: null → "done" → "rejected" → null
  - Initializes member status object if missing
  - Persists to storage via `saveData()`

- Member management: `addMember()` (lines 539-543), `removeMember(name)` (lines 545-547)
  - Duplicate prevention: checks existing members
  - Cascading: no cleanup of historical task status when member removed

- Admin pin validation: password check (lines 110-113)
  - Exact string comparison: `pinInput === data.adminPin`
  - Error state management: `setPinError(true)`

- Data persistence: `saveData()` async function (lines 77-84)
  - JSON serialization: `JSON.stringify(newData)`
  - Storage via `window.storage.set(STORAGE_KEY, ...)`
  - Error handling: catch block logs to console

## Storage Integration

**Storage Interface:**
- Custom polyfill at `src/main.jsx` lines 7-15: `window.storage` with async `get()` and `set()` methods
- Storage key: `"taskboard-data"` constant (line 3)
- Data format: JSON string serialization

**Storage Testing Gaps:**
- No validation of storage availability
- No testing of localStorage quota exceeded scenarios
- No testing of concurrent writes

## State Management Testing Challenges

**Pattern-Specific Issues:**
- Heavy reliance on inline callback closures with state captures
- Example: `addTask()` uses captured `week`, `data` from closure (lines 503-510)
- Each operation spreads entire `data` object, making it difficult to isolate
- No separation of business logic from UI state updates

## Async Testing Needs

**Async Patterns Present:**
- `useEffect` with IIFE async: data loading on mount (lines 65-75)
- Async callbacks: `saveData()` with `window.storage.set()` (line 80)
- Countdown timer: `useEffect` with `setInterval()` (lines 457-460)

**Current Approach:**
- No proper async/await testing
- No promise validation
- No timeout handling

## Untested Edge Cases

**Critical gaps:**
- Storage failure scenarios: What happens when `window.storage.set()` fails? (Currently just logs)
- Malformed JSON in storage: No validation after `JSON.parse()`
- Empty task array behavior: Task operations not validated for empty state
- Week boundary transitions: No logic for weekly rollover
- Concurrent member operations: No race condition handling
- Timezone issues with deadline countdown

## Type Checking

**Current State:**
- No TypeScript
- No PropTypes
- No runtime type validation
- No JSDoc type annotations

## Suggested Testing Architecture

**If tests were to be added:**

1. Unit test candidates:
   - Pure functions extracted from components: status toggle logic, task filtering
   - Storage serialization/deserialization
   - Countdown time calculation

2. Integration test candidates:
   - Data flow from Admin → Landing → Member views
   - Storage persistence across component remounts
   - Pin validation flow

3. Component test candidates:
   - StatusDot visual states (done, rejected, pending)
   - CountDown timer updates
   - Form input validation and error display

4. E2E test candidates:
   - Admin workflow: create task → publish → verify on member view
   - Member workflow: see task → mark complete → admin review
   - Pin protection: landing → admin click → pin entry → error handling

---

*Testing analysis: 2026-04-10*
