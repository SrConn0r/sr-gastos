import { Form, Head, Link, router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Plus,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { ListLabel, ListRow } from '@/components/list-row';
import { TransactionDialog } from '@/components/transaction-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, cn, formatDate, formatMoney } from '@/lib/utils';
import { destroy, index } from '@/routes/transactions';
import type { Account, Category, Paginated, Transaction } from '@/types';

type Filters = Partial<
    Record<
        | 'search'
        | 'type'
        | 'category'
        | 'currency'
        | 'account'
        | 'review'
        | 'date_from'
        | 'date_to',
        string
    >
>;

type Props = {
    transactions: Paginated<Transaction>;
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
    accounts: Pick<Account, 'id' | 'name' | 'currency' | 'archived_at'>[];
    filters: Filters;
};

const withoutEmpty = (data: Record<string, FormDataConvertible>) =>
    Object.fromEntries(
        Object.entries(data).filter(
            ([, value]) => value !== '' && value !== 'all',
        ),
    );

/** "Hoy", "Ayer" or the formatted date, for grouping the list. */
function dayLabel(date: string) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const local = (day: Date) => day.toLocaleDateString('en-CA');

    if (date === local(today)) {
        return 'Hoy';
    }

    if (date === local(yesterday)) {
        return 'Ayer';
    }

    return formatDate(date);
}

export default function Transactions({
    transactions,
    categories,
    accounts,
    filters,
}: Props) {
    const [showFilters, setShowFilters] = useState(
        Object.keys(filters).some((key) => key !== 'search'),
    );
    const groups = Object.entries(
        Object.groupBy(transactions.data, (transaction) => transaction.date),
    );

    return (
        <>
            <Head title="Movimientos" />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Movimientos"
                        description="Gastos e ingresos del hogar"
                    />
                    <TransactionDialog
                        categories={categories}
                        accounts={accounts}
                        trigger={
                            <Button>
                                <Plus /> Nuevo
                            </Button>
                        }
                    />
                </div>

                <Form
                    {...index.form()}
                    transform={withoutEmpty}
                    options={{
                        preserveScroll: true,
                        preserveState: true,
                        replace: true,
                    }}
                    className="grid grid-cols-[1fr_auto] gap-2"
                >
                    {({ errors }) => (
                        <>
                            <Input
                                type="search"
                                name="search"
                                placeholder="Buscar"
                                aria-label="Buscar"
                                defaultValue={filters.search}
                            />
                            <Button
                                type="button"
                                variant={showFilters ? 'ink' : 'outline'}
                                size="icon"
                                className="size-11"
                                aria-label="Filtros"
                                aria-expanded={showFilters}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal />
                            </Button>
                            <div
                                className={cn(
                                    'col-span-full grid gap-2 sm:grid-cols-2',
                                    !showFilters && 'hidden',
                                )}
                            >
                                <Select
                                    name="type"
                                    defaultValue={filters.type ?? 'all'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-label="Tipo"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Gastos e ingresos
                                        </SelectItem>
                                        <SelectItem value="expense">
                                            Gastos
                                        </SelectItem>
                                        <SelectItem value="income">
                                            Ingresos
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    name="category"
                                    defaultValue={filters.category ?? 'all'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-label="Categoría"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas las categorías
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    name="currency"
                                    defaultValue={filters.currency ?? 'all'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-label="Moneda"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas las monedas
                                        </SelectItem>
                                        {CURRENCIES.map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    name="account"
                                    defaultValue={filters.account ?? 'all'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-label="Cuenta"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas las cuentas
                                        </SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem
                                                key={account.id}
                                                value={String(account.id)}
                                            >
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    name="review"
                                    defaultValue={filters.review ?? 'all'}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-label="Revisión"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Por revisar
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    name="date_from"
                                    aria-label="Desde"
                                    defaultValue={filters.date_from}
                                />
                                <Input
                                    type="date"
                                    name="date_to"
                                    aria-label="Hasta"
                                    defaultValue={filters.date_to}
                                />
                                <InputError
                                    className="col-span-full"
                                    message={errors.date_to}
                                />
                                <div className="col-span-full flex gap-2">
                                    <Button type="submit" className="flex-1">
                                        Filtrar
                                    </Button>
                                    <Button variant="ghost" asChild>
                                        <Link href={index()}>Limpiar</Link>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>

                <div className="flex flex-col gap-2">
                    {groups.map(([date, items]) => (
                        <section key={date} className="flex flex-col gap-2">
                            <ListLabel>{dayLabel(date)}</ListLabel>
                            {items?.map((transaction) => {
                                const income =
                                    transaction.category.type === 'income';

                                return (
                                    <TransactionDialog
                                        key={transaction.id}
                                        categories={categories}
                                        accounts={accounts}
                                        transaction={transaction}
                                        footer={
                                            <ConfirmDelete
                                                label="Eliminar movimiento"
                                                description="Esto eliminará el movimiento permanentemente."
                                                onConfirm={() =>
                                                    router.delete(
                                                        destroy.url(
                                                            transaction.id,
                                                        ),
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            />
                                        }
                                        trigger={
                                            <ListRow
                                                icon={
                                                    income ? (
                                                        <ArrowDownLeft className="text-success" />
                                                    ) : (
                                                        <ArrowUpRight />
                                                    )
                                                }
                                                title={
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="truncate">
                                                            {transaction.title}
                                                        </span>
                                                    </span>
                                                }
                                                subtitle={
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="truncate">
                                                            {[
                                                                transaction
                                                                    .category
                                                                    .name,
                                                                transaction
                                                                    .account
                                                                    ?.name,
                                                                transaction.user
                                                                    ?.name,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' · ')}
                                                        </span>
                                                        {transaction.inbound_email_id && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="shrink-0"
                                                            >
                                                                Auto
                                                            </Badge>
                                                        )}
                                                        {transaction.needs_review && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="shrink-0"
                                                            >
                                                                Por revisar
                                                            </Badge>
                                                        )}
                                                    </span>
                                                }
                                                value={
                                                    <span
                                                        className={cn(
                                                            'font-semibold',
                                                            income &&
                                                                'text-success',
                                                        )}
                                                    >
                                                        {income ? '+' : '−'}
                                                        {formatMoney(
                                                            transaction.amount,
                                                            transaction.currency,
                                                        )}
                                                    </span>
                                                }
                                            />
                                        }
                                    />
                                );
                            })}
                        </section>
                    ))}
                    {transactions.data.length === 0 && (
                        <p className="py-16 text-center text-muted-foreground">
                            No hay movimientos.
                        </p>
                    )}
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant="outline"
                            disabled={!transactions.prev_page_url}
                            onClick={() =>
                                transactions.prev_page_url &&
                                router.visit(transactions.prev_page_url, {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {transactions.current_page} de{' '}
                            {transactions.last_page}
                        </span>
                        <Button
                            variant="outline"
                            disabled={!transactions.next_page_url}
                            onClick={() =>
                                transactions.next_page_url &&
                                router.visit(transactions.next_page_url, {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

Transactions.layout = {
    breadcrumbs: [{ title: 'Movimientos', href: index() }],
};
