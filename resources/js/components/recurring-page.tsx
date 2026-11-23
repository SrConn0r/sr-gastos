import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Receipt } from 'lucide-react';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import { RecurringDialog } from '@/components/recurring-dialog';
import { TransactionDialog } from '@/components/transaction-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CURRENCIES, MONTHS, cn, formatDate, formatMoney } from '@/lib/utils';
import { destroy } from '@/routes/recurring-expenses';
import type { Category, RecurringExpense, RecurringKind } from '@/types';

export type RecurringItem = RecurringExpense & {
    next_due_date: string;
    status: 'inactive' | 'paid' | 'overdue' | 'pending' | 'scheduled';
};

const STATUS = {
    paid: { label: 'Pagado este mes', variant: 'secondary' },
    overdue: { label: 'Vencido', variant: 'destructive' },
    pending: { label: 'Pendiente', variant: 'outline' },
    scheduled: { label: 'Programado', variant: 'outline' },
    inactive: { label: 'Inactivo', variant: 'outline' },
} as const;

export type RecurringPageProps = {
    items: RecurringItem[];
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
};

const COPY = {
    fixed: {
        title: 'Gastos fijos',
        description: 'Pagos mensuales aproximados: arriendo, servicios, deudas',
        add: 'Nuevo',
        day: 'Pago',
        empty: 'Aún no tienes gastos fijos.',
    },
    subscription: {
        title: 'Suscripciones',
        description: 'Servicios que se cobran en una fecha de corte',
        add: 'Nueva',
        day: 'Corte',
        empty: 'Aún no tienes suscripciones.',
    },
};

/** Sum of active items per currency for one frequency, e.g. "$ 1.200.000 · US$ 20,00". */
function totalFor(
    items: RecurringItem[],
    frequency: RecurringItem['frequency'],
) {
    return CURRENCIES.map((currency) => {
        const matching = items.filter(
            (item) =>
                item.active &&
                item.frequency === frequency &&
                item.currency === currency,
        );

        return matching.length
            ? formatMoney(
                  matching.reduce((sum, item) => sum + Number(item.amount), 0),
                  currency,
              )
            : null;
    })
        .filter(Boolean)
        .join(' · ');
}

export function RecurringPage({
    kind,
    items,
    categories,
}: RecurringPageProps & { kind: RecurringKind }) {
    const copy = COPY[kind];
    const monthly = totalFor(items, 'monthly');
    const yearly = totalFor(items, 'yearly');

    return (
        <>
            <Head title={copy.title} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title={copy.title}
                        description={copy.description}
                    />
                    <RecurringDialog
                        kind={kind}
                        categories={categories}
                        trigger={
                            <Button>
                                <Plus /> {copy.add}
                            </Button>
                        }
                    />
                </div>

                {(monthly || yearly) && (
                    <p className="text-sm text-muted-foreground">
                        {monthly && (
                            <>
                                Total mensual:{' '}
                                <span className="font-medium text-foreground">
                                    {monthly}
                                </span>
                            </>
                        )}
                        {monthly && yearly && ' · '}
                        {yearly && (
                            <>
                                Total anual:{' '}
                                <span className="font-medium text-foreground">
                                    {yearly}
                                </span>
                            </>
                        )}
                    </p>
                )}

                <div className="overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="text-right">
                                    Monto
                                </TableHead>
                                <TableHead>{copy.day}</TableHead>
                                <TableHead className="hidden lg:table-cell">
                                    Próximo
                                </TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className={cn(
                                        !item.active && 'text-muted-foreground',
                                    )}
                                >
                                    <TableCell>
                                        <p className="font-medium">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.category?.name}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {kind === 'fixed' && '≈ '}
                                        {formatMoney(
                                            item.amount,
                                            item.currency,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.frequency === 'yearly'
                                            ? `${item.day} de ${MONTHS[(item.month ?? 1) - 1]}`
                                            : `Día ${item.day}`}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {item.active
                                            ? formatDate(item.next_due_date)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                STATUS[item.status].variant
                                            }
                                        >
                                            {STATUS[item.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {item.active && (
                                            <TransactionDialog
                                                categories={categories}
                                                payment={item}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Registrar pago"
                                                        title="Registrar pago"
                                                    >
                                                        <Receipt />
                                                    </Button>
                                                }
                                            />
                                        )}
                                        <RecurringDialog
                                            kind={kind}
                                            categories={categories}
                                            item={item}
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Editar"
                                                >
                                                    <Pencil />
                                                </Button>
                                            }
                                        />
                                        <ConfirmDelete
                                            label="Eliminar"
                                            description="Los pagos ya registrados se conservan en Movimientos."
                                            onConfirm={() =>
                                                router.delete(
                                                    destroy.url(item.id),
                                                    {
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        {copy.empty}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
