import { Currency } from '@/lib/utils';
import { CurrencyTotal } from '@/types/expense';

export interface Category {
    id: number;
    name: string;
    budget?: number;
    budget_currency: Currency;
    budget_spent?: number;
    remaining_budget?: number | null;
    totals?: CurrencyTotal[];
}
