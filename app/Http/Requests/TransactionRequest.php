<?php

namespace App\Http\Requests;

use App\Enums\Currency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999999'],
            'currency' => ['required', Rule::enum(Currency::class)],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'category_id' => ['required', 'exists:categories,id'],
            'account_id' => ['nullable', 'exists:accounts,id'],
            'recurring_expense_id' => ['nullable', 'exists:recurring_expenses,id'],
        ];
    }
}
