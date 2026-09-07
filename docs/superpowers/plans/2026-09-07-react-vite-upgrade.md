# React And Vite Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the verified Laravel 13 frontend from React 18/Vite 6 to React 19/Vite 8 without changing the UI.

**Architecture:** Upgrade React first while still on the familiar bundler, resolve type/deprecation issues, then upgrade Vite and its plugins. Use the existing TypeScript compiler and client/SSR production builds as compatibility gates.

**Tech Stack:** Node.js 24, npm 11, React 18→19, Vite 6→8, Inertia 2, TypeScript, Tailwind 3.

**Spec:** `docs/superpowers/specs/2026-09-07-household-ledger-modernization-design.md`

## Global Constraints

- Begin only after the Laravel 13 plan passes completely.
- Preserve rendered structure, classes, layout, and behavior.
- Use Node.js 24 locally and in CI.
- Keep Tailwind on major version 3.
- Do not add a frontend test framework solely for this upgrade.
- Do not advance while TypeScript or either production build fails.

---

### Task 1: Upgrade React 18 To React 19

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify compatibility sites reported by TypeScript under `resources/js/`

**Interfaces:**
- Produces: React and React DOM 19.2-compatible client and SSR entry points.

- [ ] **Step 1: Capture the React 18 baseline**

Run: `npm ls react react-dom @types/react @types/react-dom && npm run check && npm run build`

Expected: React 18.3.x and all commands exit 0.

- [ ] **Step 2: Install React 19 and matching types**

Run: `npm install react@^19.2.0 react-dom@^19.2.0 @types/react@^19.2.0 @types/react-dom@^19.2.0`

- [ ] **Step 3: Resolve real React 19 type failures**

Run `npm run check`. Update only reported incompatibilities, following `https://react.dev/blog/2024/04/25/react-19-upgrade-guide`. Do not rewrite working components to use new React APIs merely because they exist.

- [ ] **Step 4: Verify React 19**

Run: `npm ls react react-dom && npm run check && npm run build && composer test`

Expected: React 19.2.x, valid client/SSR builds, and all backend tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json resources/js
git commit -m "build: upgrade to React 19"
```

### Task 2: Upgrade Vite 6 To Vite 8

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.js`
- Modify only when compatibility requires it: `postcss.config.js`, `resources/js/app.tsx`, `resources/js/ssr.tsx`

**Interfaces:**
- Consumes: passing React 19 checkpoint.
- Produces: Vite 8 client and SSR builds through Laravel's Vite integration.

- [ ] **Step 1: Check compatible first-party package releases**

Run: `npm view vite version && npm view @vitejs/plugin-react version && npm view laravel-vite-plugin version && npm view @inertiajs/react version`

Expected: registry metadata is available before editing constraints.

- [ ] **Step 2: Install supported Vite integration majors**

Run: `npm install -D vite@^8.1.0 @vitejs/plugin-react@^6.0.0 laravel-vite-plugin@latest && npm install @inertiajs/react@latest`

Keep `laravel-vite-plugin` and `@inertiajs/react` versions selected by npm only if their declared peer dependencies accept Vite 8 and React 19; verify with `npm ls`.

- [ ] **Step 3: Apply required Vite 8 configuration changes**

Follow `https://vite.dev/guide/migration.html` for Vite 7 and Vite 8. Preserve the current Laravel inputs and SSR entry. Remove options only when Vite reports them as unsupported.

- [ ] **Step 4: Refresh browser compatibility data**

Run: `npx update-browserslist-db@latest`

Expected: `package-lock.json` updates and the stale `caniuse-lite` build warning disappears.

- [ ] **Step 5: Verify Vite 8 and the complete application**

Run: `npm ls --depth=0 && npm run check && npm run build && composer lint && composer test`

Expected: no invalid peer dependency tree, Vite 8.x, successful client/SSR builds, clean Pint, and 0 test failures.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js postcss.config.js resources/js/app.tsx resources/js/ssr.tsx
git commit -m "build: upgrade to Vite 8"
```

### Task 3: Final Modernization Verification

**Files:**
- Modify only if verification exposes a regression: the directly responsible source or test file

**Interfaces:**
- Produces: the completed Laravel 13, React 19, Vite 8 household ledger release candidate.

- [ ] **Step 1: Verify dependency versions**

Run: `php artisan --version && npm ls react react-dom vite && composer show laravel/framework`

Expected: Laravel 13.x, React 19.2.x, and Vite 8.x.

- [ ] **Step 2: Run every automated gate**

Run: `composer validate --strict --no-check-publish && composer lint && composer test && npm run check && npm run build`

Expected: every command exits 0, with no failing tests, style errors, TypeScript errors, peer dependency errors, or build warnings caused by stale browser data.

- [ ] **Step 3: Inspect the final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only intentional modernization files remain uncommitted.
