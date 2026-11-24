import { Head, router } from '@inertiajs/react';
import { CalendarClock, House, Plus, Receipt } from 'lucide-react';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import { ListRow } from '@/components/list-row';
import { RecurringDialog } from '@/components/recurring-dialog';
import { TransactionDialog } from '@/components/transaction-dialog';
import { Button } from '@/components/ui/button';
import { CURRENCIES, MONTHS, cn, formatMoney } from '@/lib/utils';
import { destroy } from '@/routes/recurring-expenses';
import type { Category, RecurringExpense, RecurringKind } from '@/types';

export type RecurringItem = RecurringExpense & {
    next_due_date: string;
    status: 'inactive' | 'paid' | 'overdue' | 'pending' | 'scheduled';
};

const STATUS = {
    paid: { label: 'Pagado', tone: 'text-success' },
    overdue: { label: 'Vencido', tone: 'text-destructive-foreground' },
    pending: { label: 'Pendiente', tone: 'text-muted-foreground' },
    scheduled: { label: 'Programado', tone: 'text-muted-foreground' },
    inactive: { label: 'Inactivo', tone: 'text-muted-foreground' },
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
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
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
                    <section className="grid grid-cols-2 gap-3 rounded-xl bg-primary p-5 text-primary-foreground">
                        {[
                            { label: 'Total mensual', value: monthly },
                            { label: 'Total anual', value: yearly },
                        ].map(
                            (total) =>
                                total.value && (
                                    <div
                                        key={total.label}
                                        className="min-w-0 last:col-start-2 first:last:col-span-2 first:last:col-start-1"
                                    >
                                        <p className="text-sm font-semibold opacity-80">
                                            {total.label}
                                        </p>
                                        <p className="text-xl font-bold tracking-tight tabular-nums">
                                            {total.value}
                                        </p>
                                    </div>
                                ),
                        )}
                    </section>
                )}

                <div className="flex flex-col gap-2">
                    {items.map((item) => (
                        <RecurringDialog
                            key={item.id}
                            kind={kind}
                            categories={categories}
                            item={item}
                            footer={
                                <ConfirmDelete
                                    label="Eliminar"
                                    description="Los pagos ya registrados se conservan en Movimientos."
                                    onConfirm={() =>
                                        router.delete(destroy.url(item.id), {
                                            preserveScroll: true,
                                        })
                                    }
                                />
                            }
                            trigger={
                                <ListRow
                                    className={cn(!item.active && 'opacity-60')}
                                    icon={
                                        kind === 'fixed' ? (
                                            <House />
                                        ) : (
                                            <CalendarClock />
                                        )
                                    }
                                    title={item.name}
                                    subtitle={
                                        item.frequency === 'yearly'
                                            ? `${item.day} de ${MONTHS[(item.month ?? 1) - 1]}`
                                            : `${copy.day} día ${item.day}`
                                    }
                                    value={
                                        <>
                                            <span className="block font-semibold">
                                                {kind === 'fixed' && '≈ '}
                                                {formatMoney(
                                                    item.amount,
                                                    item.currency,
                                                )}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-xs font-medium',
                                                    STATUS[item.status].tone,
                                                )}
                                            >
                                                {STATUS[item.status].label}
                                            </span>
                                        </>
                                    }
                                    action={
                                        item.active && (
                                            <TransactionDialog
                                                categories={categories}
                                                payment={item}
                                                trigger={
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        aria-label={`Registrar pago de ${item.name}`}
                                                        title="Registrar pago"
                                                    >
                                                        <Receipt />
                                                    </Button>
                                                }
                                            />
                                        )
                                    }
                                />
                            }
                        />
                    ))}
                    {items.length === 0 && (
                        <p className="py-16 text-center text-muted-foreground">
                            {copy.empty}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
