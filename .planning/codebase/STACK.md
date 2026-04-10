# Technology Stack

**Analysis Date:** 2026-04-10

## Languages

**Primary:**
- JavaScript (ES2021+) - Application logic and UI
- JSX - React component templates in `src/main.jsx`, `task-board.jsx`
- CSS - Styling via inline styles and `src/index.css`

**Secondary:**
- HTML - Entry point template `index.html` (zh-CN locale)

## Runtime

**Environment:**
- Node.js (version not specified in codebase)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.1.0 - UI library for building the weekly task board interface
- React DOM 19.1.0 - React rendering for browser DOM

**Build/Dev:**
- Vite 6.3.2 - Fast development server and production bundler
- @vitejs/plugin-react 4.4.1 - React JSX transformation for Vite

## Key Dependencies

**Critical:**
- react - Core UI framework, version ^19.1.0
- react-dom - DOM rendering, version ^19.1.0
- vite - Module bundler and dev server, version ^6.3.2
- @vitejs/plugin-react - Enables React/JSX support in Vite, version ^4.4.1

**Infrastructure:**
- None detected - No database drivers, API clients, or external service SDKs

## Configuration

**Environment:**
- No `.env` file detected in codebase
- Configuration appears to be hardcoded in `task-board.jsx` (admin PIN: "8888", member names)

**Build:**
- `vite.config.js` - Main build configuration
  - React plugin enabled for JSX support
  - Default Vite settings (no custom optimization)

## Platform Requirements

**Development:**
- Node.js and npm
- Modern browser with ES2021+ support
- No external services required

**Production:**
- Static hosting (HTML + JavaScript bundle)
- Browser with localStorage support (used for data persistence in `src/main.jsx`)
- Requires Internet connectivity for Google Fonts CDN (`https://fonts.googleapis.com`)

---

*Stack analysis: 2026-04-10*
