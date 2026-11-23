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
