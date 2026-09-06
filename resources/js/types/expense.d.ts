import { Currency } from '@/lib/utils';
import { Category } from './category';

export type Expense = {
    id: number;
    title: string;
    amount: number;
    currency: Currency;
    expense_date: Date;
    category: Category;
}

export type CurrencyTotal = {
    currency: Currency;
    total: number;
}
