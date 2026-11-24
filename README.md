# SR Gastos

SR Gastos is a private household ledger built with Laravel 13, Inertia and React (Laravel React starter kit). Two trusted accounts share all categories, movements and budgets; each movement records who created it.

## Features

- **Movements**: expenses and income in COP, USD or BRL, with search, type, category, currency and date filters.
- **Categories**: typed as expense or income. Expense categories can have a monthly budget in one currency.
- **Fixed expenses**: approximate monthly bills (rent, internet, utilities) with a payment day.
- **Subscriptions**: monthly or yearly charges with a billing day, which can be switched off.
- **Payments**: "Registrar pago" creates the movement prefilled from the fixed expense or subscription, so each one shows as paid, pending, overdue or scheduled this month.
- **Dashboard**: monthly income, expenses and balance per currency, bills and subscriptions still due this month, budget progress, expenses by category and a 12-month income vs expenses chart.
- **Bank emails**: a Gmail Apps Script forwards bank notifications every hour; an hourly job classifies each one with AI (expense, income, internal transfer or noise), picks the account and category, and records it. Unsure results are flagged "Por revisar"; the "Correos" page shows every email and lets you retry failures.
- **Accounts**: bank accounts, wallets and credit cards, each with its currency; movements can belong to one.
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

## Bank email ingestion

1. In `.env`: `INBOUND_EMAIL_TOKEN` (a long random string, e.g. `php -r "echo bin2hex(random_bytes(32));"`), `OWNER_EMAIL`, `AI_PROVIDER=anthropic`, `AI_MODEL`, `AI_EFFORT`, `ANTHROPIC_API_KEY`.
2. Run the scheduler every minute (on Hostinger: hPanel → Advanced → Cron Jobs):

    ```
    * * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
    ```

3. Install `docs/gmail-apps-script.js` in the owner's Google account (instructions at the top of the file).
4. Create your accounts in **Cuentas** (add the last 4 digits so the AI can match them).

Run `php artisan inbound-emails:process` to process pending emails now.

The AI layer lives in `app/Ai`: tasks depend on the `AiProvider` interface only. To add a provider, implement `AiProvider`, add a case to the binding in `AppServiceProvider`, and its credentials to `config/ai.php`.

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
