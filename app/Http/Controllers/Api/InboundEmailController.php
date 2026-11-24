<?php

namespace App\Http\Controllers\Api;

use App\Enums\InboundEmailStatus;
use App\Http\Controllers\Controller;
use App\Models\InboundEmail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

/** Receives bank notification emails from the Gmail Apps Script; they stay pending until processed. */
class InboundEmailController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $token = config('services.inbound_email.token');
        abort_if(! is_string($token) || $token === '', 503, 'Inbound email token is not configured.');
        abort_unless(hash_equals($token, (string) $request->bearerToken()), 401);

        $owner = User::where('email', config('app.owner.email'))->first();
        abort_if($owner === null, 503, 'Owner user not found.');

        $data = $request->validate([
            'emails' => ['required', 'array', 'min:1', 'max:100'],
            'emails.*.message_id' => ['required', 'string', 'max:255'],
            'emails.*.from' => ['required', 'string', 'max:255'],
            'emails.*.subject' => ['nullable', 'string', 'max:500'],
            'emails.*.date' => ['required', 'date'],
            'emails.*.body' => ['nullable', 'string', 'max:100000'],
        ]);

        $new = 0;
        foreach ($data['emails'] as $email) {
            $stored = InboundEmail::firstOrCreate(['message_id' => $email['message_id']], [
                'user_id' => $owner->id,
                'from' => $email['from'],
                'subject' => $email['subject'] ?? '',
                'received_at' => Date::parse($email['date'])->setTimezone((string) config('app.timezone')),
                'body' => $email['body'] ?? '',
                'status' => InboundEmailStatus::Pending,
            ]);
            $new += $stored->wasRecentlyCreated ? 1 : 0;
        }

        return response()->json(['received' => count($data['emails']), 'new' => $new]);
    }
}
