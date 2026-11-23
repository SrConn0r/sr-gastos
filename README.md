# SR Gastos

SR Gastos is a private household ledger built with Laravel 13, Inertia and React (Laravel React starter kit). Two trusted accounts share all categories, movements and budgets; each movement records who created it.

## Features

- **Movements**: expenses and income in COP, USD or BRL, with search, type, category, currency and date filters.
- **Categories**: typed as expense or income. Expense categories can have a monthly budget in one currency.
- **Fixed expenses**: approximate monthly bills (rent, internet, utilities) with a payment day.
- **Subscriptions**: monthly or yearly charges with a billing day, which can be switched off.
- **Payments**: "Registrar pago" creates the movement prefilled from the fixed expense or subscription, so each one shows as paid, pending, overdue or scheduled this month.
- **Dashboard**: monthly income, expenses and balance per currency, bills and subscriptions still due this month, budget progress, expenses by category and a 12-month income vs expenses chart.
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
- A due day past the end of a month (e.g. 31 in February) falls on its last day. Fixed expenses are always monthly.
- Deleting a fixed expense or subscription keeps its past payments as regular movements.
