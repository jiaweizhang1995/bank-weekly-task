# External Integrations

**Analysis Date:** 2026-04-10

## APIs & External Services

**Web Fonts:**
- Google Fonts - Provides typefaces for UI rendering
  - Fonts loaded: Bricolage Grotesque (400, 600, 700, 800 weights) and Albert Sans (300, 400, 500, 600, 700 weights)
  - URL: `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Albert+Sans:wght@300;400;500;600;700&display=swap`
  - Implementation: Injected via `<style>` tag in `task-board.jsx` (FontLoader component, line 47-54)

## Data Storage

**Databases:**
- None detected - No database integration

**File Storage:**
- Local filesystem only - No external file storage service

**Client-Side Storage:**
- Browser localStorage - Persists task board data locally
  - Key: `taskboard-data`
  - Polyfill abstraction: `window.storage` object defined in `src/main.jsx` (lines 7-15)
  - Stores JSON-serialized application state including admin PIN, member list, tasks, and current week data
  - Implementation: `window.storage.get()` and `window.storage.set()` async methods

**Caching:**
- Browser cache via localStorage only
- No external cache service (Redis, Memcached, etc.)

## Authentication & Identity

**Auth Provider:**
- Custom PIN-based authentication
  - Admin access protected by hardcoded PIN: "8888" (stored in `defaultData` in `task-board.jsx`, line 6)
  - Authentication implemented in admin login view (lines 98-133)
  - No OAuth, LDAP, or external identity provider

**Session Management:**
- Client-side only
- State managed via React `useState` hook in `App` component (`currentMember`, `view` state)
- No persistent session tokens or authentication cookies

## Monitoring & Observability

**Error Tracking:**
- None detected - No error tracking service (Sentry, Rollbar, etc.)

**Logs:**
- Browser console only
  - `console.error()` used in `src/main.jsx` for localStorage save failures (line 82)
  - No centralized logging service

## CI/CD & Deployment

**Hosting:**
- Not specified - Deploy as static files to any static hosting provider
- Requires Node.js + npm for build process
- Vite builds to static HTML, CSS, JavaScript output (output directory not specified in vite.config.js)

**CI Pipeline:**
- None detected in codebase configuration

## Environment Configuration

**Required env vars:**
- None detected - Application is fully self-contained with hardcoded defaults

**Secrets location:**
- None detected - Admin PIN hardcoded in `task-board.jsx` (not environment-managed)
- No credential files (.env, .env.local, etc.) present

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Data Persistence Model

**Storage Architecture:**
- Single-source-of-truth: localStorage via `window.storage` abstraction
- All application state persisted as single JSON object: `taskboard-data`
- Data structure:
  ```javascript
  {
    adminPin: string,
    members: string[],
    tasks: object[],
    currentWeek: object | null
  }
  ```
- Async save pattern: `saveData()` callback in `App` component updates state and persists to localStorage

---

*Integration audit: 2026-04-10*
