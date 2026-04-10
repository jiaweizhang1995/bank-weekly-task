# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```
bank-weekly-task/
├── index.html              # HTML entry point, loads React app
├── task-board.jsx          # Main component file (1059 lines)
├── vite.config.js          # Vite build configuration
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── src/
│   ├── main.jsx            # React application entry, storage polyfill
│   └── index.css           # Global CSS resets and base styles
└── .planning/
    └── codebase/           # Documentation directory
```

## Directory Purposes

**Project Root:**
- Purpose: Build configuration, package management, and entry points
- Contains: HTML template, main JSX component, build config
- Key files: `index.html`, `task-board.jsx`, `package.json`, `vite.config.js`

**src/**
- Purpose: React application source code and styling
- Contains: Application entry point and global styles
- Key files: `src/main.jsx`, `src/index.css`

**.planning/codebase/**
- Purpose: Codebase analysis and planning documentation
- Contains: Architecture and structure analysis documents
- Key files: ARCHITECTURE.md, STRUCTURE.md, and future planning docs

## Key File Locations

**Entry Points:**
- `index.html`: Browser entry point defining root DOM element and script loading
- `src/main.jsx`: React application entry, initializes root render and storage polyfill
- `task-board.jsx`: App component and all UI component definitions

**Configuration:**
- `package.json`: Project metadata, dependencies (React 19, React-DOM 19), build scripts
- `vite.config.js`: Vite bundler configuration with React plugin
- `.prettierrc` (if present): Code formatting rules (not currently detected)
- `.eslintrc` (if present): Linting rules (not currently detected)

**Core Logic:**
- `task-board.jsx`: All business logic, state management, component definitions
  - Color token system (lines 12-45)
  - Component definitions (lines 47-1057)
  - Style object definition (lines 972-1057)

**Styling:**
- `task-board.jsx`: Inline styles within style object `s`
- `src/index.css`: Global CSS resets and body styling

## Naming Conventions

**Files:**
- `.jsx` extension: React functional components with JSX
- `.js` extension: Configuration and utility files
- Lowercase with hyphens: Configuration files (vite.config.js)
- kebab-case: HTML file (index.html)

**Components:**
- PascalCase: All React components (App, Landing, AdminView, MemberView, StatusBoard, Header, SectionHeading, LoadingScreen)
- Single-responsibility naming reflecting view or feature (Landing, AdminView, MemberView)

**Functions:**
- camelCase: Event handlers and utility functions (markDone, addTask, removeTask, saveData, toggleStatus, publishWeek)
- Purpose-driven: Name indicates action (saveData, toggleStatus, removeTask)

**Variables:**
- camelCase: State variables (taskName, taskDesc, currentMember, pinInput)
- Abbreviated colors: `c` object for colors, `s` object for styles
- Uppercase: Constants (STORAGE_KEY)

**CSS Classes:**
- Not used; all styling inline via style objects
- Color token keys: lowercase abbreviations (c.accent, c.textMuted, c.borderSub)

## Where to Add New Code

**New Feature (e.g., New View Type):**
- Primary code: Add component function in `task-board.jsx` following existing patterns
- Router integration: Update view state switch in App() component
- Styling: Add color/style tokens to `c` and `s` objects
- Example: Add new view like `ReportView()` and add "report" case to view routing

**New Component/Module:**
- Keep in `task-board.jsx` as functional component
- Follow existing component patterns with inline styles
- Place before export statement at end of file
- Use color tokens from `c` object and button/input styles from `s` object

**Utilities/Helpers:**
- Add before component definitions in `task-board.jsx`
- Prefix with comment block (e.g., `/* =================== Helper Name =================== */`)
- Example location: After FontLoader, before App component

**New State/Data Structure:**
- Add to defaultData object (lines 5-10)
- Add useState hooks to relevant component
- Update saveData() calls to include new state
- Example: New field like `tasks` would go in currentWeek object

**Global Styles:**
- Add to `src/index.css` for truly global styles (rarely needed)
- Prefer inline styles via `s` object or specific component style objects
- Reset styles already present in index.css

## Special Directories

**node_modules/**
- Purpose: NPM package dependencies
- Generated: Yes (by npm install)
- Committed: No (.gitignore)
- Contains: React, React-DOM, Vite, and plugin dependencies

**.git/**
- Purpose: Git version control
- Generated: Yes (by git init)
- Committed: Git metadata only
- Contains: Repository history and configuration

**.planning/**
- Purpose: Project planning and documentation
- Generated: No (manually created)
- Committed: Yes (markdown planning documents)
- Contains: Codebase analysis and phase planning

## Import/Module Resolution

**Current Approach:**
- ES modules enabled: `"type": "module"` in package.json
- Relative paths: All imports use relative paths (./, ../)
- No path aliases: No tsconfig or import aliases configured

**Import Examples:**
- `import App from '../task-board.jsx'` (in src/main.jsx)
- `import React from 'react'` (node_modules)
- No barrel files used currently

## Development Workflow

**Start Development:**
```bash
npm run dev
```
Runs Vite dev server, watches task-board.jsx and src/ for changes

**Build for Production:**
```bash
npm run build
```
Runs Vite build, outputs optimized bundle

**File Organization for New Work:**
1. All components in task-board.jsx
2. Styling via `s` object or inline styles object parameter
3. Color tokens via `c` object
4. State management with useState/useCallback in relevant component
5. Persist via saveData callback which uses window.storage.set()

---

*Structure analysis: 2026-04-10*
