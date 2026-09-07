# SR Gastos

SR Gastos is a private household expense ledger built with Laravel, Inertia, and React. It is designed for two trusted accounts that share all categories, expenses, reports, and budgets.

## Requirements

- PHP 8.4 with Composer
- Node.js 24 with npm
- MySQL 8 or a compatible database

## Local Setup

```bash
composer install
npm install
cp .env.example .env
docker compose up -d mysql
php artisan key:generate
php artisan migrate
composer dev
```

`docker compose up -d mysql` starts MySQL 8.4 on `localhost:3306` using the values in `.env`; its data is stored in the `mysql-data` Docker volume. The `DB_*` and `MYSQL_APP_*` credentials in `.env.example` match by default—keep them aligned if you change either. To use another local port, change `FORWARD_DB_PORT`. `composer dev` starts Laravel, Vite, the queue listener, and the local log viewer. The app has no public registration route; create the two household users through a seeder or `php artisan tinker`.

## Quality Checks

```bash
composer lint
composer test
npm run check
npm run build
```

Tests use an in-memory SQLite database. Pint checks PHP formatting, TypeScript validates the frontend, and the production build includes browser and SSR bundles.

## Ledger Rules

All authenticated users see and manage the same household data. Expenses support COP, USD, and BRL without converting or combining currencies. Each category has one budget currency; monthly spending only reduces that budget when the expense currency matches. Dashboard filters are also applied to CSV exports.

Categories with recorded expenses cannot be deleted, preserving ledger history. Expense dates cannot be in the future, and amounts must be positive.

## Production

Set `APP_ENV=production`, `APP_DEBUG=false`, a secure `APP_KEY`, HTTPS-aware `APP_URL`, and production database credentials. Then run:

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan optimize
```

Serve Laravel through a production web server. Add a supervised queue worker only when background jobs are introduced.
