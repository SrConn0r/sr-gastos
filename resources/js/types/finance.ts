export type Currency = 'COP' | 'USD' | 'BRL';

export type CategoryType = 'expense' | 'income';

export type Category = {
    id: number;
    name: string;
    type: CategoryType;
    budget: string | null;
    budget_currency: Currency;
    transactions_count?: number;
};

export type Transaction = {
    id: number;
    title: string;
    amount: string;
    currency: Currency;
    date: string;
    category_id: number;
    category: Pick<Category, 'id' | 'name' | 'type'>;
    user: { id: number; name: string } | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type RecurringKind = 'fixed' | 'subscription';

export type RecurringExpense = {
    id: number;
    kind: RecurringKind;
    name: string;
    category_id: number;
    category?: Pick<Category, 'id' | 'name'>;
    amount: string;
    currency: Currency;
    frequency: 'monthly' | 'yearly';
    day: number;
    month: number | null;
    active: boolean;
    last_paid_on: string | null;
};

export type AccountKind = 'deposit' | 'credit_card';

export type Account = {
    id: number;
    name: string;
    institution: string;
    kind: AccountKind;
    currency: Currency;
    last4: string | null;
    archived_at: string | null;
    transactions_count?: number;
};
