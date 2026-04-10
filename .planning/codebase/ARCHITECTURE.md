# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Single-Page Application (SPA) with Component-Based UI Architecture

**Key Characteristics:**
- Client-side rendering with React 19
- Monolithic single-file component structure
- localStorage-backed state persistence
- View-based routing (landing, member, admin-login, admin)
- Localized Chinese UI for team task management

## Layers

**Presentation Layer:**
- Purpose: Render user interface components and handle user interactions
- Location: `task-board.jsx` (primary), `src/main.jsx` (entry point)
- Contains: React functional components, styled-components via inline styles, view components
- Depends on: State management layer, color tokens, styling utilities
- Used by: Browser DOM

**State Management Layer:**
- Purpose: Manage application state (tasks, members, admin settings, current week data)
- Location: `task-board.jsx` (useState, useCallback, useEffect hooks)
- Contains: React state hooks managing data flow, save operations
- Depends on: Storage layer
- Used by: Presentation layer components

**Storage Layer:**
- Purpose: Persist application data to browser storage
- Location: `src/main.jsx` (window.storage polyfill)
- Contains: localStorage wrapper providing async get/set interface
- Depends on: Browser APIs
- Used by: State management layer

**Design System Layer:**
- Purpose: Centralized color tokens and styling standards
- Location: `task-board.jsx` (color constants `c`, style object `s`)
- Contains: OKLCH color palette, consistent spacing, font families, button/input styles
- Depends on: None
- Used by: All presentation components

## Data Flow

**On Application Load:**

1. App component initializes with loading state
2. useEffect hook in App triggers on mount
3. window.storage.get("taskboard-data") retrieves persisted state
4. State hydrated with either saved data or defaultData
5. Loading screen dismissed, landing view rendered

**Task Submission Flow (Member View):**

1. Member selects "标记完成" button on task item
2. markDone() handler called with taskId
3. New status object created: `newStatus[member][taskId] = "done"`
4. saveData() triggered, updates local state
5. window.storage.set() persists updated structure
6. Component re-renders with completed task styling

**Admin Task Creation Flow:**

1. Admin enters task name/description in AdminView
2. addTask() handler triggered on button click
3. New task object created: `{ id: Date.now().toString(), name, desc }`
4. Added to currentWeek.tasks array
5. saveData() persists entire data structure with new task
6. Task immediately appears in member views and status table

**Weekly Reset Flow:**

1. Admin clicks "清空本周任务（开始新一周）" button
2. resetWeek() resets currentWeek to empty structure
3. saveData() clears all task and status data
4. Next week's task creation begins from clean slate

## Key Abstractions

**Functional Component:**
- Purpose: Encapsulate view logic and rendering
- Examples: `App()`, `Landing()`, `AdminView()`, `MemberView()`, `StatusBoard()`, `StatusDot()`
- Pattern: Pure functions receiving props, returning JSX with internal state hooks

**Data State Model:**
- Purpose: Represent application domain entities
- Structure: `{ adminPin, members[], currentWeek: { tasks[], status{}, deadline, penalty, announcement } }`
- Pattern: Immutable-style updates via setData callbacks

**Color Token System:**
- Purpose: Ensure consistent visual language across all views
- Examples: `c.accent` (terracotta), `c.success` (warm green), `c.danger` (warm red)
- Pattern: Centralized OKLCH color palette with semantic naming

**View Pattern:**
- Purpose: Route between different application states
- Examples: "landing", "member", "admin-login", "admin"
- Pattern: Top-level switch on view state, rendering complete view component per route

## Entry Points

**Browser Entry Point:**
- Location: `index.html` (root DOM div with id="root")
- Triggers: Page load
- Responsibilities: Define document structure, load Google fonts, render React app

**React Application Entry:**
- Location: `src/main.jsx`
- Triggers: Bundle execution after index.html loads
- Responsibilities: Polyfill window.storage, create React root, render App component

**Component Entry:**
- Location: `task-board.jsx` App() function
- Triggers: React root render
- Responsibilities: Initialize application state, manage view routing, coordinate saveData callbacks

## Error Handling

**Strategy:** Try-catch with fallback to defaults, user-friendly alert dialogs

**Patterns:**
- Storage retrieval wrapped in try-catch, defaults to defaultData on failure
- PIN validation with visual error state (pinError flag)
- Async storage operations include error logging without blocking UI
- Form submission guards (taskName.trim(), pin length checks)

## Cross-Cutting Concerns

**Logging:** Console.error() for storage failures, minimal elsewhere

**Validation:** Client-side guards in event handlers (trim checks, length checks, duplicate member checks)

**Authentication:** Simple PIN-based admin access with hardcoded 8888 default via adminPin state

**Date/Time:** JavaScript Date objects for deadline calculations, locale-aware formatting with `toLocaleString("zh-CN")`

**i18n:** All UI text hardcoded in Chinese (zh-CN), no i18n framework used

---

*Architecture analysis: 2026-04-10*
