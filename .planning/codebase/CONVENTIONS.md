# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**
- Component files: PascalCase with `.jsx` extension (e.g., `task-board.jsx`)
- Config files: lowercase with dot notation (e.g., `vite.config.js`)
- Entry point: `src/main.jsx`

**Functions:**
- Component functions: PascalCase (e.g., `App`, `Landing`, `MemberView`, `AdminView`, `StatusBoard`, `Header`, `SectionHeading`, `LoadingScreen`, `CountDown`, `StatusDot`)
- Helper functions: camelCase (e.g., `publishWeek`, `addTask`, `removeTask`, `toggleStatus`, `addMember`, `removeMember`, `changePin`, `markDone`)
- Arrow functions preferred for callbacks and event handlers

**Variables:**
- State variables: camelCase (e.g., `data`, `view`, `currentMember`, `pinInput`, `loading`, `taskName`, `taskDesc`, `deadline`, `penalty`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`)
- Design tokens: single lowercase letter (e.g., `c` for color tokens, `s` for styles)

**Types:**
- Object literals for data structures (e.g., `defaultData`, `week` state object)
- Component props passed as single objects in JSX

## Code Style

**Formatting:**
- No explicit formatter configured (eslint/prettier absent)
- 2-space indentation appears consistent
- Line length varies; some lines exceed 100 characters
- Inline styles predominant for component styling

**Linting:**
- No ESLint configuration detected
- No Prettier configuration detected
- Code written in ES module syntax (`import`/`export default`)

## Import Organization

**Order:**
1. React imports at top (`import { useState, useEffect, useCallback } from "react"`)
2. Constants defined immediately after imports
3. No path aliases used

**Path Style:**
- Relative paths: `import App from '../task-board.jsx'`
- No `@` aliases or custom path mapping

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (`async` IIFE in useEffect at line 66)
- Silent error fallback: `catch { setData(defaultData); }` (line 71)
- Logged errors: `console.error("Save failed:", e)` (line 82)
- User-facing validation: `if (!taskName.trim()) return;` (line 504)
- Error UI feedback: `{pinError && <p style={{ color: c.danger, ... }}>密码错误</p>}` (line 119)

## Logging

**Framework:** `console.error()` only

**Patterns:**
- Error logging for failed save operations: `console.error("Save failed:", e)`
- No debug logging or info logging present
- No structured logging or custom logger

## Comments

**When to Comment:**
- Section delimiters used extensively: `/* =================== Component Name =================== */`
- Color token documentation: inline comments like `// warm linen base`, `// deep warm charcoal`
- Sparse functional comments (most code self-documenting)

**JSDoc/TSDoc:**
- None present; no function documentation

## Function Design

**Size:**
- Component functions range from ~20 lines (StatusDot, Header, SectionHeading) to ~100+ lines (App, AdminView, MemberView)
- Helper functions 5-15 lines typically (addTask, removeTask, etc.)

**Parameters:**
- Destructured object props for components: `function Landing({ data, onSelectMember, onAdminClick })`
- Single object parameters for state updates: `saveData(updated)`
- Callback pattern: `onSelectMember(name)`, `onBack()`

**Return Values:**
- Components return JSX or null: `if (loading || !data) return <LoadingScreen />;`
- Helper functions return side-effects or modified state: `const updated = { ...data, currentWeek: { ...week, ... } }`

## Module Design

**Exports:**
- Single default export: `export default App;` at end of `task-board.jsx` (line 1059)
- All other components internal to the file (not exported)

**File Structure:**
- Single monolithic file `task-board.jsx` (1059 lines) containing all component definitions
- Shared components grouped together (Header, SectionHeading at lines 894-939)
- Utility components (StatusDot, CountDown, LoadingScreen) mixed with view components

## State Management

**Pattern:** React hooks only
- `useState` for component state: `const [data, setData] = useState(null)`
- `useEffect` for side effects: data loading on mount, countdown timer updates
- `useCallback` for memoized callbacks: `const saveData = useCallback(async (newData) => ...)`
- No context API used despite multiple levels of prop drilling
- Props passed down through component tree: `data` and `saveData` passed to Landing, AdminView, MemberView

## Inline Styles

**Approach:**
- All styling through inline style objects
- No CSS modules or CSS-in-JS libraries
- Style object reuse: `s` object (lines 973-1057) contains reusable style definitions
- Component-specific styles: inline definitions like `{{ ...s.card, background: c.accentSoft }}`

**Color System:**
- Centralized color token object `c` (lines 13-45) using OKLCH color space
- Organized by category: Surfaces, Text, Accent, Semantic, Borders, Interactive
- Inline color usage: `style={{ color: c.danger, ... }}`

## Naming Conventions Summary

- **Components:** PascalCase for all React components
- **Hooks:** standard React pattern (useState, useEffect, useCallback)
- **Callbacks:** verb pattern with `on` prefix (onSelectMember, onAdminClick, onBack)
- **Data keys:** short camelCase (name, id, desc, status, tasks, members, currentWeek)
- **Chinese content:** used directly in UI strings and variable comments (for localization context)

---

*Convention analysis: 2026-04-10*
