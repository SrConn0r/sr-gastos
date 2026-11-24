<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('accounts/index', [
            'accounts' => Account::withCount('transactions')
                ->orderByRaw('archived_at is not null')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(AccountRequest $request): RedirectResponse
    {
        Account::create($request->safe()->except('archived'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cuenta creada.']);

        return back();
    }

    public function update(AccountRequest $request, Account $account): RedirectResponse
    {
        $account->update([
            ...$request->safe()->except('archived'),
            'archived_at' => $request->boolean('archived') ? ($account->archived_at ?? now()) : null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cuenta actualizada.']);

        return back();
    }

    public function destroy(Account $account): RedirectResponse
    {
        if ($account->transactions()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'La cuenta tiene movimientos: archívala en lugar de eliminarla.']);

            return back();
        }

        $account->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cuenta eliminada.']);

        return back();
    }
}
