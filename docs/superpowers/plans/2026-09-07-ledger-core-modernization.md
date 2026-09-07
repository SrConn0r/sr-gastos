# Ledger Core Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SR Gastos a private shared-household ledger with correct monthly, currency-aware budgets, protected deletion, filters, pagination, export, CI, and project documentation.

**Architecture:** Keep categories and expenses global and authorize access at the route boundary. Reuse `ExpenseController@index` for dashboard queries, use three focused form requests for validation, and share one filtered Eloquent query between the dashboard and CSV export.

**Tech Stack:** PHP 8.4, Laravel 11, Pest 3, Inertia 2, React 18, TypeScript, MySQL/SQLite tests.

**Spec:** `docs/superpowers/specs/2026-09-07-household-ledger-modernization-design.md`

## Global Constraints

- Preserve the current dashboard layout and visual language.
- Categories and expenses remain shared by all authenticated users and have no `user_id`.
- All ledger routes require `auth` and `verified`; public registration is disabled.
- Monthly calculations use `expense_date` in the application timezone.
- Never combine or convert values from different currencies.
- Category deletion must preserve referenced expenses.
- Tailwind remains on major version 3.

---

### Task 1: Lock Down Household Access

**Files:**
- Modify: `routes/web.php`
- Modify: `routes/auth.php`
- Modify: `resources/js/Components/forms/expense-form.tsx`
- Delete: `resources/js/Pages/Welcome.tsx`
- Delete: `resources/js/Pages/Auth/Register.tsx`
- Delete: `app/Http/Controllers/Auth/RegisteredUserController.php`
- Test: `tests/Feature/HouseholdAccessTest.php`
- Modify: `tests/Feature/Auth/RegistrationTest.php`

**Interfaces:**
- Produces: named routes `dashboard`, `expenses.store`, `expense.update`, `expense.destroy`, `category.store`, `category.update`, `category.destroy`, and `expenses.export` behind `auth` plus `verified`.

- [ ] **Step 1: Write failing access tests**

```php
<?php

use App\Models\Category;
use App\Models\User;

it('redirects guests from the root page to login', function () {
    $this->get('/')->assertRedirect(route('login'));
});

it('does not expose self registration', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register', [])->assertNotFound();
});

it('requires authentication to create ledger records', function () {
    $category = Category::create(['name' => 'Food']);

    $this->post(route('expenses.store'), [
        'title' => 'Lunch',
        'amount' => 20,
        'currency' => 'COP',
        'expense_date' => '2026-09-07',
        'category_id' => $category->id,
    ])->assertRedirect(route('login'));
});

it('redirects authenticated users from root to the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get('/')
        ->assertRedirect(route('dashboard'));
});
```

- [ ] **Step 2: Verify RED**

Run: `php artisan test tests/Feature/HouseholdAccessTest.php tests/Feature/Auth/RegistrationTest.php`

Expected: failures because `/` renders `Welcome`, registration exists, and the public transaction route is still used.

- [ ] **Step 3: Restrict routes and use the authenticated store route**

In `routes/web.php`, redirect `/` according to authentication, keep profile routes under `auth`, and expose only implemented ledger actions under `['auth', 'verified']`. Remove `api/transactions` and duplicate resource routes.

```php
Route::get('/', fn () => redirect()->route(auth()->check() ? 'dashboard' : 'login'));

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [ExpenseController::class, 'index'])->name('dashboard');
    Route::get('/expenses/export', [ExpenseController::class, 'export'])->name('expenses.export');
    Route::resource('expenses', ExpenseController::class)->only(['store', 'update', 'destroy']);
    Route::resource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
});
```

Remove registration routes from `routes/auth.php`. Change the create branch in `expense-form.tsx` to `post(route('expenses.store'), ...)`.

- [ ] **Step 4: Verify GREEN**

Run: `php artisan test tests/Feature/HouseholdAccessTest.php tests/Feature/Auth/RegistrationTest.php`

Expected: all selected tests pass.

- [ ] **Step 5: Commit**

```bash
git add routes/web.php routes/auth.php resources/js/Components/forms/expense-form.tsx resources/js/Pages/Welcome.tsx resources/js/Pages/Auth/Register.tsx app/Http/Controllers/Auth/RegisteredUserController.php tests/Feature/HouseholdAccessTest.php tests/Feature/Auth/RegistrationTest.php
git commit -m "fix: restrict household ledger access"
```

### Task 2: Remove Obsolete Per-User Ownership Code

**Files:**
- Modify: `app/Http/Controllers/ExpenseController.php`
- Modify: `app/Models/Expense.php`
- Modify: `bootstrap/providers.php`
- Delete: `app/Policies/ExpensePolicy.php`
- Delete: `app/Providers/AuthServiceProvider.php`
- Test: `tests/Feature/HouseholdAccessTest.php`

**Interfaces:**
- Consumes: authenticated ledger routes from Task 1.
- Produces: equal shared access to every expense for both authenticated users.

- [ ] **Step 1: Add a failing shared-dashboard test**

```php
it('shows the shared expenses to either household user', function () {
    $second = User::factory()->create();
    $category = Category::create(['name' => 'Food']);
    Expense::create([
        'title' => 'Lunch', 'amount' => 20, 'currency' => 'USD',
        'expense_date' => '2026-09-07', 'category_id' => $category->id,
    ]);

    $this->actingAs($second)->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('expenses.0.title', 'Lunch')
        );
});
```

- [ ] **Step 2: Verify RED**

Run: `php artisan test tests/Feature/HouseholdAccessTest.php --filter="shared expenses"`

Expected: failure because `ExpenseController@index` queries the removed `user_id` column and paginates after loading a collection.

- [ ] **Step 3: Remove stale ownership artifacts**

Delete the policy and provider, remove `Auth`, `AuthorizesRequests`, `user_id`, and commented authorization calls from `ExpenseController`, remove `Expense::user()`, and remove `AuthServiceProvider::class` from `bootstrap/providers.php`. Replace the broken index query with `Expense::with('category')->orderByDesc('expense_date')->get()` and return the existing dashboard props with empty monthly arrays until Task 5 implements aggregation.

- [ ] **Step 4: Verify GREEN**

Run: `php artisan test tests/Feature/HouseholdAccessTest.php`

Expected: all household access tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ExpenseController.php app/Models/Expense.php app/Policies/ExpensePolicy.php app/Providers/AuthServiceProvider.php bootstrap/providers.php tests/Feature/HouseholdAccessTest.php
git commit -m "refactor: remove stale expense ownership"
```

### Task 3: Add Category Budget Currency And Safe Deletion

**Files:**
- Create: `database/migrations/2026_09_07_000000_add_budget_currency_and_restrict_category_deletion.php`
- Create: `app/Http/Requests/CategoryRequest.php`
- Modify: `app/Models/Category.php`
- Modify: `app/Http/Controllers/CategoryController.php`
- Modify: `resources/js/types/category.d.ts`
- Modify: `resources/js/Components/forms/category-form.tsx`
- Test: `tests/Feature/CategoryTest.php`

**Interfaces:**
- Produces: `Category::$budget_currency` with values `COP|USD|BRL`; category deletion redirects with `errors.category` when expenses exist.

- [ ] **Step 1: Write failing category tests**

```php
<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;

it('stores a budget currency', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('category.store'), [
            'name' => 'Food', 'budget' => 500, 'budget_currency' => 'USD',
        ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('categories', [
        'name' => 'Food', 'budget_currency' => 'USD',
    ]);
});

it('rejects deleting a category that has expenses', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Food']);
    Expense::create([
        'title' => 'Lunch', 'amount' => 20, 'currency' => 'USD',
        'expense_date' => '2026-09-07', 'category_id' => $category->id,
    ]);

    $this->actingAs($user)->delete(route('category.destroy', $category))
        ->assertSessionHasErrors('category');

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
    $this->assertDatabaseHas('expenses', ['category_id' => $category->id]);
});
```

- [ ] **Step 2: Verify RED**

Run: `php artisan test tests/Feature/CategoryTest.php`

Expected: failures because `budget_currency` does not exist and deletion cascades.

- [ ] **Step 3: Implement migration, validation, and guard**

The migration adds `$table->string('budget_currency', 3)->default('COP')->after('budget')`, replaces the expense category foreign key with `restrictOnDelete()`, and reverses both changes in `down()`.

`CategoryRequest::rules()` returns:

```php
return [
    'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($this->route('category'))],
    'budget' => ['nullable', 'numeric', 'min:0'],
    'budget_currency' => ['required_with:budget', Rule::in(Expense::CURRENCIES)],
];
```

Use `CategoryRequest` in `store` and `update`. In `destroy`, reject before deletion:

```php
if ($category->expenses()->exists()) {
    return back()->withErrors(['category' => 'Move or delete this category’s expenses before deleting it.']);
}
```

Add `budget_currency` to `Category::$fillable`, casts, frontend type, and existing category form using the current currency `Select` component.

- [ ] **Step 4: Verify GREEN**

Run: `php artisan test tests/Feature/CategoryTest.php`

Expected: all category tests pass.

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_09_07_000000_add_budget_currency_and_restrict_category_deletion.php app/Http/Requests/CategoryRequest.php app/Models/Category.php app/Http/Controllers/CategoryController.php resources/js/types/category.d.ts resources/js/Components/forms/category-form.tsx tests/Feature/CategoryTest.php
git commit -m "feat: add currency-aware category budgets"
```

### Task 4: Centralize Expense Validation

**Files:**
- Create: `app/Http/Requests/ExpenseRequest.php`
- Modify: `app/Http/Controllers/ExpenseController.php`
- Test: `tests/Feature/ExpenseTest.php`

**Interfaces:**
- Produces: `ExpenseRequest::rules(): array`; normalized default currency `COP` in `validatedExpense()`.

- [ ] **Step 1: Write failing validation tests**

```php
<?php

use App\Models\Category;
use App\Models\User;

it('defaults an omitted expense currency to COP', function () {
    $category = Category::create(['name' => 'Transport']);

    $this->actingAs(User::factory()->create())->post(route('expenses.store'), [
        'title' => 'Taxi', 'amount' => 15000,
        'expense_date' => '2026-09-07', 'category_id' => $category->id,
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('expenses', ['title' => 'Taxi', 'currency' => 'COP']);
});

it('rejects unsupported currencies and future dates', function () {
    $category = Category::create(['name' => 'Travel']);

    $this->actingAs(User::factory()->create())->post(route('expenses.store'), [
        'title' => 'Flight', 'amount' => 100, 'currency' => 'EUR',
        'expense_date' => now()->addDay()->toDateString(), 'category_id' => $category->id,
    ])->assertSessionHasErrors(['currency', 'expense_date']);
});
```

- [ ] **Step 2: Verify RED**

Run: `php artisan test tests/Feature/ExpenseTest.php`

Expected: future-date assertion fails and validation remains duplicated.

- [ ] **Step 3: Implement the request**

```php
public function rules(): array
{
    return [
        'title' => ['required', 'string', 'max:255'],
        'amount' => ['required', 'numeric', 'min:0.01'],
        'currency' => ['nullable', Rule::in(Expense::CURRENCIES)],
        'expense_date' => ['required', 'date', 'before_or_equal:today'],
        'category_id' => ['required', 'exists:categories,id'],
    ];
}

public function validatedExpense(): array
{
    return [...$this->validated(), 'currency' => $this->validated('currency') ?? Expense::DEFAULT_CURRENCY];
}
```

Use `ExpenseRequest` and `validatedExpense()` in both `store` and `update`; remove unused category lookups.

- [ ] **Step 4: Verify GREEN**

Run: `php artisan test tests/Feature/ExpenseTest.php tests/Feature/ExpenseCurrencyTest.php`

Expected: all expense validation and currency tests pass after changing old public-store tests to authenticated `expenses.store` requests.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Requests/ExpenseRequest.php app/Http/Controllers/ExpenseController.php tests/Feature/ExpenseTest.php tests/Feature/ExpenseCurrencyTest.php
git commit -m "refactor: centralize expense validation"
```

### Task 5: Correct Monthly Totals And Budgets

**Files:**
- Modify: `app/Http/Controllers/ExpenseController.php`
- Modify: `app/Models/Category.php`
- Modify: `resources/js/types/category.d.ts`
- Modify: `resources/js/Components/widgets/month-expense-total.tsx`
- Test: `tests/Feature/DashboardTest.php`

**Interfaces:**
- Produces Inertia props: `monthExpenseTotal: CurrencyTotal[]` and `monthExpenseTotalByCategory: CategoryTotal[]`, where each category total includes `budget`, `budget_currency`, `budget_spent`, `remaining_budget`, and `totals`.

- [ ] **Step 1: Write failing month-boundary and budget tests**

```php
it('uses expense_date for monthly totals and keeps currencies separate', function () {
    Carbon::setTestNow('2026-09-15 12:00:00');
    $user = User::factory()->create();
    $category = Category::create([
        'name' => 'Food', 'budget' => 100, 'budget_currency' => 'USD',
    ]);
    Expense::create(['title' => 'USD meal', 'amount' => 40, 'currency' => 'USD', 'expense_date' => '2026-09-01', 'category_id' => $category->id]);
    Expense::create(['title' => 'COP meal', 'amount' => 20000, 'currency' => 'COP', 'expense_date' => '2026-09-02', 'category_id' => $category->id]);
    Expense::create(['title' => 'Old meal', 'amount' => 30, 'currency' => 'USD', 'expense_date' => '2026-08-31', 'category_id' => $category->id]);

    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
        ->where('monthExpenseTotal.0.currency', 'COP')
        ->where('monthExpenseTotal.0.total', 20000)
        ->where('monthExpenseTotal.1.currency', 'USD')
        ->where('monthExpenseTotal.1.total', 40)
        ->where('monthExpenseTotalByCategory.0.budget_spent', 40)
        ->where('monthExpenseTotalByCategory.0.remaining_budget', 60)
    );
});
```

- [ ] **Step 2: Verify RED**

Run: `php artisan test tests/Feature/DashboardTest.php`

Expected: failure because the dashboard uses `created_at` and exposes no monthly budget fields.

- [ ] **Step 3: Implement monthly aggregation**

In `ExpenseController@index`, select monthly expenses with:

```php
$monthExpenses = Expense::query()
    ->with('category')
    ->whereBetween('expense_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
    ->get();
```

Group totals by currency. For each category, sum matching `budget_currency` expenses into `budget_spent`, calculate nullable `remaining_budget`, and retain all per-currency totals. Remove the obsolete `Category::getRemainingBudgetAttribute()` all-time query. Render these existing props in `MonthExpenseTotal` using current Card/Accordion styles.

- [ ] **Step 4: Verify GREEN**

Run: `php artisan test tests/Feature/DashboardTest.php tests/Feature/ExpenseCurrencyTest.php`

Expected: all dashboard accounting tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ExpenseController.php app/Models/Category.php resources/js/types/category.d.ts resources/js/Components/widgets/month-expense-total.tsx tests/Feature/DashboardTest.php tests/Feature/ExpenseCurrencyTest.php
git commit -m "fix: calculate monthly currency-aware budgets"
```

### Task 6: Add Server-Side Filters, Pagination, And CSV Export

**Files:**
- Create: `app/Http/Requests/ExpenseFilterRequest.php`
- Modify: `app/Http/Controllers/ExpenseController.php`
- Modify: `resources/js/Pages/Dashboard.tsx`
- Modify: `resources/js/Components/ui/data-table.tsx`
- Modify: `resources/js/types/expense.d.ts`
- Test: `tests/Feature/ExpenseFilterTest.php`

**Interfaces:**
- Produces: `ExpenseFilterRequest::filters(): array`, `ExpenseController::filteredQuery(array $filters): Builder`, paginated `expenses`, echoed `filters`, and streamed `expenses.export` CSV.

- [ ] **Step 1: Write failing filter and export tests**

```php
it('filters the dashboard and export with the same criteria', function () {
    $user = User::factory()->create();
    $food = Category::create(['name' => 'Food']);
    $travel = Category::create(['name' => 'Travel']);
    Expense::create(['title' => 'Lunch', 'amount' => 20, 'currency' => 'USD', 'expense_date' => '2026-09-01', 'category_id' => $food->id]);
    Expense::create(['title' => 'Taxi', 'amount' => 50000, 'currency' => 'COP', 'expense_date' => '2026-08-01', 'category_id' => $travel->id]);
    $query = ['search' => 'Lunch', 'category' => $food->id, 'currency' => 'USD', 'date_from' => '2026-09-01', 'date_to' => '2026-09-30'];

    $this->actingAs($user)->get(route('dashboard', $query))->assertInertia(fn (Assert $page) => $page
        ->has('expenses.data', 1)
        ->where('expenses.data.0.title', 'Lunch')
        ->where('filters.currency', 'USD')
    );

    $this->actingAs($user)->get(route('expenses.export', $query))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8')
        ->assertSee('Lunch')
        ->assertDontSee('Taxi');
});
```

- [ ] **Step 2: Verify RED**

Run: `php artisan test tests/Feature/ExpenseFilterTest.php`

Expected: failure because pagination, filters, and export are absent.

- [ ] **Step 3: Implement one shared filtered query**

Validate `search` as nullable string max 255, `category` with `exists:categories,id`, `currency` with `Rule::in(Expense::CURRENCIES)`, dates as valid dates, and `date_to` as `after_or_equal:date_from`.

`filteredQuery()` starts with `Expense::query()->with('category')`, conditionally applies title search, category, currency, and inclusive expense-date bounds, then orders by `expense_date` and `id` descending. `index()` uses `paginate(15)->withQueryString()`. `export()` uses `response()->streamDownload()` and `fputcsv()` with a UTF-8 BOM and literal column headers.

Update `Dashboard` to consume Laravel paginator data, preserve current table columns, and add existing Input/Select/Button controls for the approved filters and export. Add a `serverPagination` option to `DataTable` so it does not paginate the already paginated page again. Render Laravel pagination links below the table with existing button styles.

- [ ] **Step 4: Verify GREEN**

Run: `php artisan test tests/Feature/ExpenseFilterTest.php`

Expected: dashboard and export return the same filtered records.

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Requests/ExpenseFilterRequest.php app/Http/Controllers/ExpenseController.php resources/js/Pages/Dashboard.tsx resources/js/Components/ui/data-table.tsx resources/js/types/expense.d.ts tests/Feature/ExpenseFilterTest.php
git commit -m "feat: add expense filters pagination and export"
```

### Task 7: Finish Accessibility And Code Hygiene

**Files:**
- Modify: `resources/js/Pages/Dashboard.tsx`
- Modify: `resources/js/Components/category-dialog.tsx`
- Modify: `resources/js/Components/ui/data-table.tsx`
- Modify: `resources/js/Components/forms/expense-form.tsx`
- Modify: `resources/js/Components/forms/category-form.tsx`
- Modify: `resources/js/lib/utils.ts`
- Modify: PHP files reported by Pint

**Interfaces:**
- Produces: accessible names on icon-only controls and a clean Pint/TypeScript baseline.

- [ ] **Step 1: Remove temporary diagnostics and unsafe touched-path casts**

Remove the filter `console.log`, avoid `errors: any` callback annotations, type expense form dates as `Date | string`, and replace avoidable `as any` casts. Add `aria-label="Edit expense"`, `aria-label="Delete expense"`, and equivalent category labels without changing classes or visible layout.

- [ ] **Step 2: Format PHP**

Run: `./vendor/bin/pint`

Expected: the seven previously reported PHP style issues are fixed.

- [ ] **Step 3: Verify static checks**

Run: `./vendor/bin/pint --test`

Expected: exit 0.

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app bootstrap routes resources/js
git commit -m "chore: clean formatting and accessibility"
```

### Task 8: Add CI And Project Documentation

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `composer.json`
- Modify: `package.json`
- Replace: `README.md`

**Interfaces:**
- Produces: `composer test`, `composer lint`, `npm run check`, and a GitHub Actions workflow using PHP 8.4 and Node 24.

- [ ] **Step 1: Add local quality commands**

Add Composer scripts:

```json
"lint": "pint --test",
"test": "@php artisan test"
```

Add the npm script:

```json
"check": "tsc --noEmit"
```

- [ ] **Step 2: Add CI**

Create one `ubuntu-latest` job using `shivammathur/setup-php@v2` with PHP 8.4 and `actions/setup-node@v4` with Node 24. Run `composer install --no-interaction --prefer-dist`, `npm ci`, `cp .env.example .env`, `php artisan key:generate`, `composer validate --strict --no-check-publish`, `composer lint`, `composer test`, `npm run check`, and `npm run build`. Set `DB_CONNECTION=sqlite` and `DB_DATABASE=:memory:` for tests.

- [ ] **Step 3: Replace the stock README**

Document SR Gastos purpose, PHP 8.4/Node 24/MySQL prerequisites, installation, `composer dev`, testing/check commands, the two-account shared-data model, disabled registration, COP/USD/BRL handling, monthly budget rules, CSV export, and production requirements (`APP_DEBUG=false`, HTTPS, migrations, build, queue worker only if jobs are added).

- [ ] **Step 4: Run the full core checkpoint**

Run: `composer validate --strict --no-check-publish`

Expected: valid Composer configuration.

Run: `composer lint && composer test && npm run check && npm run build`

Expected: every command exits 0 with 0 test failures and no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml composer.json package.json README.md
git commit -m "ci: verify and document the household ledger"
```
