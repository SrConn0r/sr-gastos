# SR Gastos

SR Gastos is a private household ledger built with Laravel 13, Inertia and React (Laravel React starter kit). Two trusted accounts share all categories, movements and budgets; each movement records who created it.

## Features

- **Movements**: expenses and income in COP, USD or BRL, with search, type, category, currency and date filters.
- **Categories**: typed as expense or income. Expense categories can have a monthly budget in one currency.
- **Dashboard**: monthly income, expenses and balance per currency, budget progress, expenses by category and a 12-month income vs expenses chart.
- **Auth**: Fortify login, password reset, email verification, two-factor and passkeys. Public registration is disabled.

## Local setup

Requires PHP 8.4, Composer, Node.js 22+ and Docker.

```bash
cp .env.example .env
docker compose up -d mysql
composer setup
php artisan db:seed   # demo user test@example.com / password + a year of sample data
composer dev
```

`compose.yaml` runs MySQL 8.4 on `localhost:3306` with the `DB_*` / `MYSQL_APP_*` values from `.env`. Create real household users with `php artisan tinker`.

## Quality checks

```bash
composer lint        # Pint
composer ci:check    # lint/format, TypeScript and Pest
./vendor/bin/phpstan analyse
npm run build
```

Tests run on in-memory SQLite.

## Ledger rules

- Currencies are never mixed or converted; totals and charts are per currency.
- A budget only counts expenses in its own currency and resets each calendar month.
- A category's type can't change after creation, and categories with movements can't be deleted.
- Movement dates can't be in the future and amounts must be positive.
