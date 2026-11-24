<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionFilterRequest;
use App\Http\Requests\TransactionRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(TransactionFilterRequest $request): Response
    {
        $filters = $request->filters();

        $transactions = Transaction::query()
            ->with(['category:id,name,type', 'user:id,name', 'account:id,name'])
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where('title', 'like', "%{$search}%"))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->whereRelation('category', 'type', $type))
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category_id', $category))
            ->when($filters['currency'] ?? null, fn (Builder $query, string $currency) => $query->where('currency', $currency))
            ->when($filters['account'] ?? null, fn (Builder $query, string $account) => $query->where('account_id', $account))
            ->when($filters['review'] ?? null, fn (Builder $query) => $query->where('needs_review', true))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('date', '<=', $date))
            ->latest('date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'type']),
            'accounts' => Account::orderBy('name')->get(['id', 'name', 'currency', 'archived_at']),
            'filters' => (object) $filters,
        ]);
    }

    public function store(TransactionRequest $request): RedirectResponse
    {
        $request->user()->transactions()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento guardado.']);

        return back();
    }

    public function update(TransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        // Saving a reviewed movement means the user checked it.
        $transaction->update([...$request->validated(), 'needs_review' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento actualizado.']);

        return back();
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $transaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento eliminado.']);

        return back();
    }
}
