<!-- GSD:project-start source:PROJECT.md -->
## Project

**Bank Weekly Task Board**

A lightweight weekly task board system for a small team (1 admin + several members). The admin publishes weekly announcements and tasks, members self-mark completion, and the admin can review and reject. Everyone accesses through the same H5 link, identifying by name selection. Admin panel is PIN-protected. The frontend (React 19 + Vite) is already built; this project adds the backend API.

**Core Value:** Members can see their weekly tasks and mark them done, and the admin can manage everything from one simple interface — no accounts, no complexity.

### Constraints

- **Tech stack**: Node.js + Express — same language as frontend for simplicity
- **Storage**: JSON file on disk — no database dependencies, fits the tiny data set
- **Deployment**: Alibaba Cloud Hong Kong ECS — frontend and backend on same server
- **Serving**: Express serves Vite-built static files + API routes on same port
- **Auth**: Simple PIN → token for admin; name parameter for members (no user auth system)
- **Scale**: 5-10 users, not designed for growth beyond small team
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES2021+) - Application logic and UI
- JSX - React component templates in `src/main.jsx`, `task-board.jsx`
- CSS - Styling via inline styles and `src/index.css`
- HTML - Entry point template `index.html` (zh-CN locale)
## Runtime
- Node.js (version not specified in codebase)
- npm
- Lockfile: `package-lock.json` present
## Frameworks
- React 19.1.0 - UI library for building the weekly task board interface
- React DOM 19.1.0 - React rendering for browser DOM
- Vite 6.3.2 - Fast development server and production bundler
- @vitejs/plugin-react 4.4.1 - React JSX transformation for Vite
## Key Dependencies
- react - Core UI framework, version ^19.1.0
- react-dom - DOM rendering, version ^19.1.0
- vite - Module bundler and dev server, version ^6.3.2
- @vitejs/plugin-react - Enables React/JSX support in Vite, version ^4.4.1
- None detected - No database drivers, API clients, or external service SDKs
## Configuration
- No `.env` file detected in codebase
- Configuration appears to be hardcoded in `task-board.jsx` (admin PIN: "8888", member names)
- `vite.config.js` - Main build configuration
## Platform Requirements
- Node.js and npm
- Modern browser with ES2021+ support
- No external services required
- Static hosting (HTML + JavaScript bundle)
- Browser with localStorage support (used for data persistence in `src/main.jsx`)
- Requires Internet connectivity for Google Fonts CDN (`https://fonts.googleapis.com`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Component files: PascalCase with `.jsx` extension (e.g., `task-board.jsx`)
- Config files: lowercase with dot notation (e.g., `vite.config.js`)
- Entry point: `src/main.jsx`
- Component functions: PascalCase (e.g., `App`, `Landing`, `MemberView`, `AdminView`, `StatusBoard`, `Header`, `SectionHeading`, `LoadingScreen`, `CountDown`, `StatusDot`)
- Helper functions: camelCase (e.g., `publishWeek`, `addTask`, `removeTask`, `toggleStatus`, `addMember`, `removeMember`, `changePin`, `markDone`)
- Arrow functions preferred for callbacks and event handlers
- State variables: camelCase (e.g., `data`, `view`, `currentMember`, `pinInput`, `loading`, `taskName`, `taskDesc`, `deadline`, `penalty`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`)
- Design tokens: single lowercase letter (e.g., `c` for color tokens, `s` for styles)
- Object literals for data structures (e.g., `defaultData`, `week` state object)
- Component props passed as single objects in JSX
## Code Style
- No explicit formatter configured (eslint/prettier absent)
- 2-space indentation appears consistent
- Line length varies; some lines exceed 100 characters
- Inline styles predominant for component styling
- No ESLint configuration detected
- No Prettier configuration detected
- Code written in ES module syntax (`import`/`export default`)
## Import Organization
- Relative paths: `import App from '../task-board.jsx'`
- No `@` aliases or custom path mapping
## Error Handling
- Try-catch blocks for async operations (`async` IIFE in useEffect at line 66)
- Silent error fallback: `catch { setData(defaultData); }` (line 71)
- Logged errors: `console.error("Save failed:", e)` (line 82)
- User-facing validation: `if (!taskName.trim()) return;` (line 504)
- Error UI feedback: `{pinError && <p style={{ color: c.danger, ... }}>密码错误</p>}` (line 119)
## Logging
- Error logging for failed save operations: `console.error("Save failed:", e)`
- No debug logging or info logging present
- No structured logging or custom logger
## Comments
- Section delimiters used extensively: `/* =================== Component Name =================== */`
- Color token documentation: inline comments like `// warm linen base`, `// deep warm charcoal`
- Sparse functional comments (most code self-documenting)
- None present; no function documentation
## Function Design
- Component functions range from ~20 lines (StatusDot, Header, SectionHeading) to ~100+ lines (App, AdminView, MemberView)
- Helper functions 5-15 lines typically (addTask, removeTask, etc.)
- Destructured object props for components: `function Landing({ data, onSelectMember, onAdminClick })`
- Single object parameters for state updates: `saveData(updated)`
- Callback pattern: `onSelectMember(name)`, `onBack()`
- Components return JSX or null: `if (loading || !data) return <LoadingScreen />;`
- Helper functions return side-effects or modified state: `const updated = { ...data, currentWeek: { ...week, ... } }`
## Module Design
- Single default export: `export default App;` at end of `task-board.jsx` (line 1059)
- All other components internal to the file (not exported)
- Single monolithic file `task-board.jsx` (1059 lines) containing all component definitions
- Shared components grouped together (Header, SectionHeading at lines 894-939)
- Utility components (StatusDot, CountDown, LoadingScreen) mixed with view components
## State Management
- `useState` for component state: `const [data, setData] = useState(null)`
- `useEffect` for side effects: data loading on mount, countdown timer updates
- `useCallback` for memoized callbacks: `const saveData = useCallback(async (newData) => ...)`
- No context API used despite multiple levels of prop drilling
- Props passed down through component tree: `data` and `saveData` passed to Landing, AdminView, MemberView
## Inline Styles
- All styling through inline style objects
- No CSS modules or CSS-in-JS libraries
- Style object reuse: `s` object (lines 973-1057) contains reusable style definitions
- Component-specific styles: inline definitions like `{{ ...s.card, background: c.accentSoft }}`
- Centralized color token object `c` (lines 13-45) using OKLCH color space
- Organized by category: Surfaces, Text, Accent, Semantic, Borders, Interactive
- Inline color usage: `style={{ color: c.danger, ... }}`
## Naming Conventions Summary
- **Components:** PascalCase for all React components
- **Hooks:** standard React pattern (useState, useEffect, useCallback)
- **Callbacks:** verb pattern with `on` prefix (onSelectMember, onAdminClick, onBack)
- **Data keys:** short camelCase (name, id, desc, status, tasks, members, currentWeek)
- **Chinese content:** used directly in UI strings and variable comments (for localization context)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Client-side rendering with React 19
- Monolithic single-file component structure
- localStorage-backed state persistence
- View-based routing (landing, member, admin-login, admin)
- Localized Chinese UI for team task management
## Layers
- Purpose: Render user interface components and handle user interactions
- Location: `task-board.jsx` (primary), `src/main.jsx` (entry point)
- Contains: React functional components, styled-components via inline styles, view components
- Depends on: State management layer, color tokens, styling utilities
- Used by: Browser DOM
- Purpose: Manage application state (tasks, members, admin settings, current week data)
- Location: `task-board.jsx` (useState, useCallback, useEffect hooks)
- Contains: React state hooks managing data flow, save operations
- Depends on: Storage layer
- Used by: Presentation layer components
- Purpose: Persist application data to browser storage
- Location: `src/main.jsx` (window.storage polyfill)
- Contains: localStorage wrapper providing async get/set interface
- Depends on: Browser APIs
- Used by: State management layer
- Purpose: Centralized color tokens and styling standards
- Location: `task-board.jsx` (color constants `c`, style object `s`)
- Contains: OKLCH color palette, consistent spacing, font families, button/input styles
- Depends on: None
- Used by: All presentation components
## Data Flow
## Key Abstractions
- Purpose: Encapsulate view logic and rendering
- Examples: `App()`, `Landing()`, `AdminView()`, `MemberView()`, `StatusBoard()`, `StatusDot()`
- Pattern: Pure functions receiving props, returning JSX with internal state hooks
- Purpose: Represent application domain entities
- Structure: `{ adminPin, members[], currentWeek: { tasks[], status{}, deadline, penalty, announcement } }`
- Pattern: Immutable-style updates via setData callbacks
- Purpose: Ensure consistent visual language across all views
- Examples: `c.accent` (terracotta), `c.success` (warm green), `c.danger` (warm red)
- Pattern: Centralized OKLCH color palette with semantic naming
- Purpose: Route between different application states
- Examples: "landing", "member", "admin-login", "admin"
- Pattern: Top-level switch on view state, rendering complete view component per route
## Entry Points
- Location: `index.html` (root DOM div with id="root")
- Triggers: Page load
- Responsibilities: Define document structure, load Google fonts, render React app
- Location: `src/main.jsx`
- Triggers: Bundle execution after index.html loads
- Responsibilities: Polyfill window.storage, create React root, render App component
- Location: `task-board.jsx` App() function
- Triggers: React root render
- Responsibilities: Initialize application state, manage view routing, coordinate saveData callbacks
## Error Handling
- Storage retrieval wrapped in try-catch, defaults to defaultData on failure
- PIN validation with visual error state (pinError flag)
- Async storage operations include error logging without blocking UI
- Form submission guards (taskName.trim(), pin length checks)
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
