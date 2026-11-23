import { Head, router } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import Heading from '@/components/heading';
import { TransactionDialog } from '@/components/transaction-dialog';
import { Badge } from '@/components/ui/badge';
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
    formatDate,
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
    expensesByCategory: { category: string; total: number }[];
    monthly: { month: string; income: number; expense: number }[];
    pending: (RecurringExpense & { due_date: string; overdue: boolean })[];
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
};

// Validated (light + dark) for CVD separation and contrast.
const chartConfig = {
    income: { label: 'Ingresos', color: '#009689' },
    expense: { label: 'Gastos', color: '#f54a00' },
    total: { label: 'Gastado', color: '#f54a00' },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat('es-CO', { notation: 'compact' });

export default function Dashboard({
    currency,
    totals,
    budgets,
    expensesByCategory,
    monthly,
    pending,
    categories,
}: Props) {
    const rows = totals.length
        ? totals
        : [{ currency: 'COP' as Currency, income: 0, expense: 0, balance: 0 }];
    const tiles = [
        { key: 'income', title: 'Ingresos del mes' },
        { key: 'expense', title: 'Gastos del mes' },
        { key: 'balance', title: 'Balance del mes' },
    ] as const;

    return (
        <>
            <Head title="Inicio" />
            <div className="flex flex-col gap-4 p-4">
                <Heading title="Inicio" description="Resumen del mes actual" />

                <div className="grid gap-4 md:grid-cols-3">
                    {tiles.map((tile) => (
                        <Card key={tile.key}>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {tile.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {rows.map((row) => (
                                    <p
                                        key={row.currency}
                                        className={cn(
                                            'text-2xl font-semibold tabular-nums',
                                            tile.key === 'balance' &&
                                                row.balance < 0 &&
                                                'text-destructive',
                                        )}
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Pendientes del mes</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {pending.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 py-2"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.kind === 'fixed'
                                                ? 'Gasto fijo'
                                                : 'Suscripción'}{' '}
                                            · {formatDate(item.due_date)}
                                        </p>
                                    </div>
                                    {item.overdue && (
                                        <Badge variant="destructive">
                                            Vencido
                                        </Badge>
                                    )}
                                    <span className="tabular-nums">
                                        {formatMoney(
                                            item.amount,
                                            item.currency,
                                        )}
                                    </span>
                                    <TransactionDialog
                                        categories={categories}
                                        payment={item}
                                        trigger={
                                            <Button variant="outline" size="sm">
                                                <Receipt /> Registrar pago
                                            </Button>
                                        }
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center justify-between gap-4">
                    <h3 className="font-medium">Gráficos</h3>
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
                                            radius={[0, 4, 4, 0]}
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
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="expense"
                                        fill="var(--color-expense)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

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
