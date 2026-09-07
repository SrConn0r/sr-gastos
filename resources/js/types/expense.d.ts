import { Currency } from '@/lib/utils';
import { Category } from './category';

export type Expense = {
    id: number;
    title: string;
    amount: number;
    currency: Currency;
    expense_date: string;
    category: Category;
}

export type CurrencyTotal = {
    currency: Currency;
    total: number;
}

export type ExpenseFilters = {
    search?: string;
    category?: number;
    currency?: Currency;
    date_from?: string;
    date_to?: string;
}

export type ExpensePaginator = {
    data: Expense[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
