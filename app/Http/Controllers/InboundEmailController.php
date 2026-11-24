<?php

namespace App\Http\Controllers;

use App\Enums\InboundEmailStatus;
use App\Models\InboundEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InboundEmailController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = array_filter($request->validate([
            'status' => ['nullable', Rule::enum(InboundEmailStatus::class)],
        ]));

        return Inertia::render('inbound-emails/index', [
            'emails' => InboundEmail::with('transaction:id,title,amount,currency,inbound_email_id')
                ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
                ->latest('received_at')
                ->latest('id')
                ->paginate(20)
                ->withQueryString(),
            'filters' => (object) $filters,
        ]);
    }

    public function retry(InboundEmail $inboundEmail): RedirectResponse
    {
        if ($inboundEmail->status === InboundEmailStatus::Failed) {
            $inboundEmail->update(['status' => InboundEmailStatus::Pending, 'attempts' => 0, 'error' => null, 'processed_at' => null]);
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Se procesará en la próxima hora.']);
        }

        return back();
    }
}
