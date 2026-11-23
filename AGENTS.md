# Repository Guidelines

## Project Structure & Module Organization

This repository is a Laravel 13 app built on the official React starter kit (Inertia, Fortify, Wayfinder, Tailwind 4, shadcn/ui). Backend code lives in `app/`, with controllers under `app/Http/Controllers`, request validation in `app/Http/Requests`, models in `app/Models`, and policies/providers in `app/Policies` and `app/Providers`. Frontend code lives in `resources/js`, organized into `pages`, `layouts`, `components`, `hooks`, `lib`, and shared `types`. Routes are defined in `routes/web.php` and `routes/settings.php`; auth routes come from Fortify. Wayfinder generates typed route helpers into `resources/js/routes` and `resources/js/actions` (gitignored); import them instead of hardcoding URLs. Database migrations, factories, and seeders are in `database/`. Tests live in `tests/Feature` and `tests/Unit`. Treat `public/build`, `bootstrap/ssr` and the Wayfinder folders as generated output.

## Build, Test, and Development Commands

Use `composer install` and `npm install` to set up dependencies. Start MySQL with `docker compose up -d mysql`, then run `composer dev` for the full local stack. Use `npm run dev` when you only need the frontend dev server. Build production assets with `npm run build`. Run the test suite with `php artisan test`, and everything CI runs with `composer ci:check`. Useful examples: `php artisan migrate` after schema changes and `php artisan optimize:clear` when cached config or routes get in the way.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, LF endings, and 4 spaces for indentation. Keep PHP classes PSR-4 aligned (`App\\...`) with singular model names such as `Expense` and `Category`. React files use kebab-case filenames such as `pages/transactions/index.tsx` and `components/transaction-dialog.tsx`; hooks use `use-*` naming. Prefer small, focused components and keep shared UI primitives in `resources/js/Components/ui`. Format PHP with `composer lint` and frontend code with `npm run check:fix` before opening a PR.

## Testing Guidelines

This project uses Pest with Laravel’s testing helpers. Feature tests automatically refresh the database, so add web and database behavior coverage under `tests/Feature`. Name tests after the behavior under test, for example `TransactionTest.php`. Run `php artisan test` before submitting changes, and add or update tests whenever routes, validation, or persistence logic changes.

## Commit & Pull Request Guidelines

Recent history favors short, imperative commit subjects, often with prefixes like `feat:` and `refactor:`; continue that style, for example `feat: add category totals to dashboard`. Keep commits focused and avoid bundling generated assets with unrelated code changes. Pull requests should include a clear summary, note any migration or environment changes, link the related issue when available, and attach screenshots for UI updates in `resources/js/Pages` or shared components.
