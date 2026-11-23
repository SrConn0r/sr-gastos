<?php

namespace App\Http\Requests;

use App\Enums\CategoryType;
use App\Enums\Currency;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var Category|null $category */
        $category = $this->route('category');
        // The type is fixed once created: changing it would turn its expenses into income.
        $type = $category?->type->value ?? $this->input('type');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->where('type', $type)->ignore($category)],
            'type' => [$category ? 'exclude' : 'required', Rule::enum(CategoryType::class)],
            'budget' => ['nullable', 'numeric', 'min:0', 'max:9999999999', Rule::prohibitedIf($type === CategoryType::Income->value)],
            'budget_currency' => ['required', Rule::enum(Currency::class)],
        ];
    }
}
