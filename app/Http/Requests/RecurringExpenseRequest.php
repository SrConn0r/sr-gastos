<?php

namespace App\Http\Requests;

use App\Enums\CategoryType;
use App\Enums\Currency;
use App\Enums\Frequency;
use App\Enums\RecurringKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecurringExpenseRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $isFixed = $this->input('kind') === RecurringKind::Fixed->value;

        return [
            'kind' => ['required', Rule::enum(RecurringKind::class)],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', Rule::exists('categories', 'id')->where('type', CategoryType::Expense->value)],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999999'],
            'currency' => ['required', Rule::enum(Currency::class)],
            // Fixed bills are always monthly; only subscriptions can be yearly.
            'frequency' => ['required', $isFixed ? Rule::in([Frequency::Monthly->value]) : Rule::enum(Frequency::class)],
            'day' => ['required', 'integer', 'between:1,31'],
            'month' => ['nullable', 'required_if:frequency,yearly', 'exclude_unless:frequency,yearly', 'integer', 'between:1,12'],
            'active' => ['boolean'],
        ];
    }

    /** @return array<string, mixed> */
    public function recurringData(): array
    {
        return ['month' => null, 'active' => false, ...$this->validated()];
    }
}
