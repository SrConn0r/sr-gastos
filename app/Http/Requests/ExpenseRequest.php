<?php

namespace App\Http\Requests;

use App\Models\Expense;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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
        return [
            ...$this->validated(),
            'currency' => $this->validated('currency') ?? Expense::DEFAULT_CURRENCY,
        ];
    }
}
