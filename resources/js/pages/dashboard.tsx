import { Head, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarClock,
    House,
    Plus,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import Heading from '@/components/heading';
import { ListLabel, ListRow } from '@/components/list-row';
import { TransactionDialog } from '@/components/transaction-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CURRENCIES,
    cn,
    formatDay,
    formatMonth,
    formatMoney,
} from '@/lib/utils';
import { dashboard } from '@/routes';
import type { Category, Currency, RecurringExpense } from '@/types';

type Props = {
    currency: Currency;
    totals: {
        currency: Currency;
        income: number;
        expense: number;
        balance: number;
    }[];
    budgets: {
        id: number;
        name: string;
        budget: number;
        currency: Currency;
        spent: number;
    }[];
    byAccount: {
        name: string;
        currency: Currency;
        income: number;
        expense: number;
    }[];
    expensesByCategory: { category: string; total: number }[];
    monthly: { month: string; income: number; expense: number }[];
    pending: (RecurringExpense & { due_date: string; overdue: boolean })[];
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
};

const chartConfig = {
    income: { label: 'Ingresos', color: 'var(--chart-1)' },
    expense: { label: 'Gastos', color: 'var(--chart-5)' },
    total: { label: 'Gastado', color: 'var(--chart-5)' },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat('es-CO', { notation: 'compact' });

export default function Dashboard({
    currency,
    totals,
    budgets,
    byAccount,
    expensesByCategory,
    monthly,
    pending,
    categories,
}: Props) {
    const rows = totals.length
        ? totals
        : [{ currency: 'COP' as Currency, income: 0, expense: 0, balance: 0 }];
    const tiles = [
        {
            key: 'income',
            title: 'Ingresos',
            icon: ArrowDownLeft,
            tone: 'bg-accent text-success',
        },
        {
            key: 'expense',
            title: 'Gastos',
            icon: ArrowUpRight,
            tone: 'bg-destructive/10 text-destructive-foreground',
        },
    ] as const;
    const [main, ...others] = rows;

    return (
        <>
            <Head title="Inicio" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
                <Heading title="Inicio" description="Resumen del mes actual" />

                <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground">
                    <div
                        aria-hidden
                        className="absolute -top-16 -right-10 size-48 rounded-full bg-white/25 blur-2xl"
                    />
                    <p className="relative text-sm font-semibold opacity-80">
                        Balance del mes
                    </p>
                    <p className="relative mt-1 text-4xl font-bold tracking-tight tabular-nums">
                        {formatMoney(main.balance, main.currency)}
                    </p>
                    {others.map((row) => (
                        <p
                            key={row.currency}
                            className="relative text-lg font-semibold tabular-nums opacity-80"
                        >
                            {formatMoney(row.balance, row.currency)}
                        </p>
                    ))}
                    <TransactionDialog
                        categories={categories}
                        trigger={
                            <Button variant="ink" className="relative mt-5">
                                <Plus /> Registrar movimiento
                            </Button>
                        }
                    />
                </section>

                <div className="grid grid-cols-2 gap-3">
                    {tiles.map((tile) => (
                        <Card key={tile.key} className="gap-3 py-4">
                            <CardContent className="space-y-2 px-4">
                                <span
                                    className={cn(
                                        'grid size-9 place-items-center rounded-full [&_svg]:size-4',
                                        tile.tone,
                                    )}
                                >
                                    <tile.icon />
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    {tile.title}
                                </p>
                                {rows.map((row) => (
                                    <p
                                        key={row.currency}
                                        className="truncate text-lg font-bold tabular-nums"
                                    >
                                        {formatMoney(
                                            row[tile.key],
                                            row.currency,
                                        )}
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {pending.length > 0 && (
                    <section className="space-y-2">
                        <ListLabel>Pendientes del mes</ListLabel>
                        {pending.map((item) => (
                            <TransactionDialog
                                key={item.id}
                                categories={categories}
                                payment={item}
                                trigger={
                                    <ListRow
                                        icon={
                                            item.kind === 'fixed' ? (
                                                <House />
                                            ) : (
                                                <CalendarClock />
                                            )
                                        }
                                        title={item.name}
                                        subtitle={`${item.kind === 'fixed' ? 'Gasto fijo' : 'Suscripción'} · ${formatDay(item.due_date)}`}
                                        aria-label={`Registrar pago de ${item.name}`}
                                        value={
                                            <>
                                                <span className="block font-semibold">
                                                    {formatMoney(
                                                        item.amount,
                                                        item.currency,
                                                    )}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium',
                                                        item.overdue
                                                            ? 'text-destructive-foreground'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {item.overdue
                                                        ? 'Vencido'
                                                        : 'Pendiente'}
                                                </span>
                                            </>
                                        }
                                    />
                                }
                            />
                        ))}
                    </section>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                    <h3 className="px-1 text-sm font-semibold text-muted-foreground">
                        Gráficos
                    </h3>
                    <Select
                        value={currency}
                        onValueChange={(value) =>
                            router.visit(
                                dashboard({ query: { currency: value } }),
                                {
                                    preserveScroll: true,
                                },
                            )
                        }
                    >
                        <SelectTrigger
                            className="w-28"
                            aria-label="Moneda de los gráficos"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((code) => (
                                <SelectItem key={code} value={code}>
                                    {code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Gastos por categoría · este mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expensesByCategory.length ? (
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto w-full"
                                    style={{
                                        height: Math.max(
                                            160,
                                            expensesByCategory.length * 40,
                                        ),
                                    }}
                                >
                                    <BarChart
                                        data={expensesByCategory}
                                        layout="vertical"
                                        margin={{ left: 8, right: 8 }}
                                    >
                                        <YAxis
                                            dataKey="category"
                                            type="category"
                                            tickLine={false}
                                            axisLine={false}
                                            width={110}
                                        />
                                        <XAxis
                                            type="number"
                                            dataKey="total"
                                            hide
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="var(--color-total)"
                                            radius={[0, 8, 8, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Sin gastos este mes en {currency}.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Ingresos vs gastos · últimos 12 meses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="aspect-auto h-64 w-full"
                            >
                                <BarChart data={monthly} barGap={2}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatMonth}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={48}
                                        tickFormatter={(value: number) =>
                                            compact.format(value)
                                        }
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) =>
                                                    formatMonth(String(value))
                                                }
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        dataKey="income"
                                        fill="var(--color-income)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="expense"
                                        fill="var(--color-expense)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {byAccount.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Por cuenta (este mes)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {byAccount.map((row) => (
                                <div
                                    key={`${row.name}-${row.currency}`}
                                    className="flex items-center justify-between gap-3 rounded-lg bg-accent/40 p-3"
                                >
                                    <span className="min-w-0 truncate font-semibold">
                                        {row.name}
                                    </span>
                                    <span className="shrink-0 text-right text-sm tabular-nums">
                                        <span className="block text-success">
                                            +
                                            {formatMoney(
                                                row.income,
                                                row.currency,
                                            )}
                                        </span>
                                        <span className="block text-muted-foreground">
                                            −
                                            {formatMoney(
                                                row.expense,
                                                row.currency,
                                            )}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {budgets.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Presupuestos del mes</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {budgets.map((budget) => {
                                const over = budget.spent > budget.budget;
                                const percent = budget.budget
                                    ? Math.min(
                                          100,
                                          (budget.spent / budget.budget) * 100,
                                      )
                                    : 100;

                                return (
                                    <div
                                        key={budget.id}
                                        className="space-y-1.5"
                                    >
                                        <div className="flex justify-between gap-2 text-sm">
                                            <span className="font-medium">
                                                {budget.name}
                                            </span>
                                            <span className="text-muted-foreground tabular-nums">
                                                {formatMoney(
                                                    budget.spent,
                                                    budget.currency,
                                                )}{' '}
                                                /{' '}
                                                {formatMoney(
                                                    budget.budget,
                                                    budget.currency,
                                                )}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full bg-primary',
                                                    over && 'bg-destructive',
                                                )}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        {over && (
                                            <p className="text-xs text-destructive">
                                                Excedido por{' '}
                                                {formatMoney(
                                                    budget.spent -
                                                        budget.budget,
                                                    budget.currency,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Inicio', href: dashboard() }],
};
