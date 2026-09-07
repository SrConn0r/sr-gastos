# Household Ledger Modernization Design

## Purpose

Modernize SR Gastos as a private, shared household ledger for two existing users. Preserve the current interface and fast expense-entry flow while correcting accounting behavior, closing public access, simplifying routing, strengthening automated checks, and moving the supported stack to Laravel 13, React 19, and Vite 8.

## Scope

This phase covers access control, shared-data semantics, monthly budgets, expense filtering and export, route and controller cleanup, automated tests and CI, dependency upgrades, and project documentation. It does not redesign the dashboard, migrate to Tailwind 4, add exchange-rate conversion, or introduce administrative account management.

## Access And Data Model

Categories and expenses are global household records. They do not belong to individual users, and both authenticated users have equal create, update, and delete access.

Public self-registration is disabled. The public root route redirects guests to login and authenticated users to the dashboard. Expense creation is removed from the public welcome page, and the unused `POST /api/transactions` route is deleted. All expense, category, export, and dashboard routes require both `auth` and `verified` middleware.

The obsolete expense ownership policy, `user()` relationship, `user_id` controller queries, and related provider registration are removed. Existing user accounts and authentication/profile behavior remain intact.

## Accounting Rules

Monthly reporting is based on `expense_date` within the application timezone, not `created_at`. Each category has a nullable decimal `budget` and a `budget_currency` limited to the same supported currencies as expenses, defaulting to `COP` for existing and new categories.

A category budget resets each calendar month. Budget progress compares the budget only with expenses whose currency matches `budget_currency`. Spending in other currencies is displayed as separate totals and is never added to, subtracted from, or converted into the budget currency. No exchange-rate service is introduced.

Deleting a category that has expenses is rejected with a clear validation message. Empty categories may be deleted normally. The database relationship is changed from cascading deletion to restricted deletion as a final integrity guard.

## Request And Dashboard Flow

`ExpenseController@index` serves the dashboard and replaces the large route closure. It returns expenses ordered by `expense_date` descending and paginated in groups of 15. Supported query parameters are `search`, `category`, `currency`, `date_from`, `date_to`, and `page`; invalid filter values are rejected or ignored consistently through request validation.

The existing dashboard uses its current components and styling. Filtering, pagination, CSV export, and monthly budget progress are integrated with existing controls without a visual redesign. Inertia navigation preserves filter state where appropriate. CSV export uses the same validated filters and streams the household expenses with title, amount, currency, expense date, and category columns.

Resource routes expose only implemented actions. Expense and category writes use their conventional named resource routes; duplicate routes and actions without controller methods are removed.

## Validation And Error Handling

Dedicated form requests centralize expense, category, and filter validation. Currency values use one authoritative supported-currency list on the backend and matching frontend types. Validation failures return through Inertia's existing form error mechanism. Category deletion conflicts return the user to the dashboard with an actionable message and preserve all data.

Money remains stored as fixed-precision decimals. Display formatting may use `Intl.NumberFormat`, but calculations are performed from database decimal values and grouped by currency.

## Upgrade Strategy

Changes are delivered in verified checkpoints:

1. Add regression tests and implement access, accounting, routing, filtering, export, and documentation changes on the existing stack.
2. Upgrade Laravel 11 to Laravel 12, run the full verification suite, then upgrade Laravel 12 to Laravel 13 and verify again.
3. Upgrade React 18 to React 19 and Vite 6 to Vite 8 with compatible first-party plugins and type packages, then update other direct dependencies only where compatible and useful.

PHP 8.4 and Node.js 24 are the supported development and CI runtimes. Tailwind remains on major version 3 during this phase.

## Testing And Delivery

Pest feature tests cover guest rejection, disabled registration, shared authenticated access, expense/category validation, month boundaries based on `expense_date`, per-currency totals, monthly budget calculations, protected category deletion, filters, pagination, and CSV export. Existing authentication and profile tests continue to pass after registration expectations are updated.

CI runs Composer validation, Pint, Pest, TypeScript checking, and the production client/SSR build. PHP style issues are fixed with Pint, temporary console logging and avoidable TypeScript `any` usage in touched paths are removed, and icon-only controls receive accessible names without changing their appearance.

The README documents the product, prerequisites, installation, local development, testing, shared-household access model, supported currencies, monthly budget rules, and deployment requirements.

## Success Criteria

- Guests cannot view or mutate ledger data, and no one can self-register.
- Both existing authenticated users see and manage the same records.
- Monthly totals and budgets use `expense_date` and never combine currencies.
- Filtering, pagination, and CSV export return consistent results.
- Categories with expenses cannot be deleted accidentally.
- Laravel 13, React 19, and Vite 8 build and pass the complete automated suite.
- The current UI layout and visual language remain unchanged.
