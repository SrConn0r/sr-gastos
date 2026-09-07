# Laravel 13 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the verified household ledger from unsupported Laravel 11 to Laravel 13 through a tested Laravel 12 checkpoint.

**Architecture:** Follow official major-version upgrade guides sequentially and change only compatibility requirements. Regenerate Composer's lock file at each major checkpoint and require the complete application suite to pass before advancing.

**Tech Stack:** PHP 8.4, Composer 2.10, Laravel 11→12→13, Pest.

**Spec:** `docs/superpowers/specs/2026-09-07-household-ledger-modernization-design.md`

## Global Constraints

- Begin only after the core modernization plan passes completely.
- Preserve application behavior and the current UI.
- Use PHP 8.4 locally and in CI.
- Follow `https://laravel.com/docs/12.x/upgrade` and the official Laravel 13 upgrade guide.
- Do not advance to the next major while any verification command fails.

---

### Task 1: Upgrade Laravel 11 To Laravel 12

**Files:**
- Modify: `composer.json`
- Modify: `composer.lock`
- Modify only when required by the guide: `config/*.php`, `bootstrap/app.php`

**Interfaces:**
- Produces: a Laravel 12 application with unchanged HTTP routes and Inertia props.

- [ ] **Step 1: Capture the Laravel 11 baseline**

Run: `php artisan --version && composer test && npm run build`

Expected: Laravel 11.x and all commands exit 0.

- [ ] **Step 2: Apply official Laravel 12 dependency constraints**

Run: `composer require laravel/framework:^12.0 nunomaduro/collision:^8.1 --dev --with-all-dependencies`

If Composer reports a package conflict, inspect it with `composer why-not laravel/framework ^12.0` and update only the named direct blocker to the compatible major documented by its maintainer.

- [ ] **Step 3: Apply relevant upgrade-guide changes**

Compare the project against the official Laravel 12 high-, medium-, and low-impact changes. This application uses integer model IDs and local filesystem defaults; do not copy optional skeleton changes that do not affect it.

- [ ] **Step 4: Verify Laravel 12**

Run: `php artisan --version && composer validate --strict --no-check-publish && composer lint && composer test && npm run check && npm run build`

Expected: Laravel 12.x and every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add composer.json composer.lock config bootstrap/app.php
git commit -m "build: upgrade to Laravel 12"
```

### Task 2: Upgrade Laravel 12 To Laravel 13

**Files:**
- Modify: `composer.json`
- Modify: `composer.lock`
- Modify only when required by the guide: `config/*.php`, `bootstrap/app.php`, application compatibility sites named by Composer or tests

**Interfaces:**
- Consumes: passing Laravel 12 checkpoint.
- Produces: Laravel 13 on PHP 8.4 with unchanged ledger behavior.

- [ ] **Step 1: Read the installed official Laravel 13 upgrade requirements**

Open the official Laravel 13 upgrade guide and record only changes affecting Eloquent, validation, routing, filesystem, or testing features used in this repository.

- [ ] **Step 2: Apply Laravel 13 constraints**

Run: `composer require php:^8.3 laravel/framework:^13.0 --with-all-dependencies`

If Composer reports a direct dev-package conflict, use `composer why-not laravel/framework ^13.0`, then update Pest, Collision, or Breeze only when that output identifies it as the blocker.

- [ ] **Step 3: Apply relevant Laravel 13 compatibility changes**

Change only code exercised by this repository. Keep the existing Laravel application bootstrap structure unless the official guide marks a change as required.

- [ ] **Step 4: Verify Laravel 13**

Run: `php artisan --version && composer validate --strict --no-check-publish && composer lint && composer test && npm run check && npm run build`

Expected: Laravel 13.x and every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add composer.json composer.lock config bootstrap app tests
git commit -m "build: upgrade to Laravel 13"
```

