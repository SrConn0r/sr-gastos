<?php

namespace App\Http\Requests;

use App\Enums\AccountKind;
use App\Enums\Currency;
use App\Models\Account;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var Account|null $account */
        $account = $this->route('account');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('accounts')->ignore($account)],
            'institution' => ['required', 'string', 'max:255'],
            'kind' => ['required', Rule::enum(AccountKind::class)],
            'currency' => ['required', Rule::enum(Currency::class)],
            'last4' => ['nullable', 'digits:4'],
            'archived' => ['boolean'],
        ];
    }
}
