<?php

namespace App\Http\Controllers;

use App\Enums\CategoryType;
use App\Enums\RecurringKind;
use App\Http\Requests\RecurringExpenseRequest;
use App\Models\Category;
use App\Models\RecurringExpense;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RecurringExpenseController extends Controller
{
    public function fixed(): Response
    {
        return $this->index(RecurringKind::Fixed);
    }

    public function subscriptions(): Response
    {
        return $this->index(RecurringKind::Subscription);
    }

    public function store(RecurringExpenseRequest $request): RedirectResponse
    {
        RecurringExpense::create($request->recurringData());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Guardado.']);

        return back();
    }

    public function update(RecurringExpenseRequest $request, RecurringExpense $recurringExpense): RedirectResponse
    {
        $recurringExpense->update($request->recurringData());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actualizado.']);

        return back();
    }

    public function destroy(RecurringExpense $recurringExpense): RedirectResponse
    {
        // Past payments stay as movements; their link is cleared by the foreign key.
        $recurringExpense->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Eliminado.']);

        return back();
    }

    private function index(RecurringKind $kind): Response
    {
        $items = RecurringExpense::with('category:id,name')
            ->where('kind', $kind)
            ->withMax('transactions as last_paid_on', 'date')
            ->orderByDesc('active')
            ->orderBy('day')
            ->get()
            ->map(fn (RecurringExpense $item) => [
                ...$item->toArray(),
                'next_due_date' => $item->nextDueDate()->toDateString(),
                'status' => $item->status(),
            ]);

        return Inertia::render($kind === RecurringKind::Fixed ? 'fixed-expenses' : 'subscriptions', [
            'items' => $items,
            'categories' => Category::where('type', CategoryType::Expense)->orderBy('name')->get(['id', 'name', 'type']),
        ]);
    }
}
