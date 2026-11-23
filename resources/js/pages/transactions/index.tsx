import { Form, Head, Link, router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';
import { Pencil, Plus } from 'lucide-react';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CURRENCIES, cn, formatDate, formatMoney } from '@/lib/utils';
import { destroy, index } from '@/routes/transactions';
import type { Category, Paginated, Transaction } from '@/types';

type Filters = Partial<
    Record<
        'search' | 'type' | 'category' | 'currency' | 'date_from' | 'date_to',
        string
    >
>;

type Props = {
    transactions: Paginated<Transaction>;
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
    filters: Filters;
};

const withoutEmpty = (data: Record<string, FormDataConvertible>) =>
    Object.fromEntries(
        Object.entries(data).filter(
            ([, value]) => value !== '' && value !== 'all',
        ),
    );

export default function Transactions({
    transactions,
    categories,
    filters,
}: Props) {
    return (
        <>
            <Head title="Movimientos" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Movimientos"
                        description="Gastos e ingresos del hogar"
                    />
                    <TransactionDialog
                        categories={categories}
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
                    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[2fr_repeat(5,1fr)_auto]"
                >
                    {({ errors }) => (
                        <>
                            <Input
                                name="search"
                                placeholder="Buscar"
                                defaultValue={filters.search}
                            />
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
                            <div className="flex gap-2">
                                <Button type="submit">Filtrar</Button>
                                <Button variant="ghost" asChild>
                                    <Link href={index()}>Limpiar</Link>
                                </Button>
                            </div>
                            <InputError
                                className="col-span-full"
                                message={errors.date_to}
                            />
                        </>
                    )}
                </Form>

                <div className="overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">
                                    Monto
                                </TableHead>
                                <TableHead className="hidden xl:table-cell">
                                    Registró
                                </TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(transaction.date)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {transaction.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {transaction.category.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-right tabular-nums',
                                            transaction.category.type ===
                                                'income' &&
                                                'text-emerald-600 dark:text-emerald-400',
                                        )}
                                    >
                                        {transaction.category.type === 'income'
                                            ? '+'
                                            : '−'}
                                        {formatMoney(
                                            transaction.amount,
                                            transaction.currency,
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden text-muted-foreground xl:table-cell">
                                        {transaction.user?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        <TransactionDialog
                                            categories={categories}
                                            transaction={transaction}
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Editar movimiento"
                                                >
                                                    <Pencil />
                                                </Button>
                                            }
                                        />
                                        <ConfirmDelete
                                            label="Eliminar movimiento"
                                            description="Esto eliminará el movimiento permanentemente."
                                            onConfirm={() =>
                                                router.delete(
                                                    destroy.url(transaction.id),
                                                    {
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No hay movimientos.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

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
            </div>
        </>
    );
}

Transactions.layout = {
    breadcrumbs: [{ title: 'Movimientos', href: index() }],
};
