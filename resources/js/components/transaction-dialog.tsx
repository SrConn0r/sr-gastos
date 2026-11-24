import { Form } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CURRENCIES, formatMoney } from '@/lib/utils';
import { store, update } from '@/routes/transactions';
import type {
    Category,
    CategoryType,
    Currency,
    RecurringExpense,
    Transaction,
} from '@/types';

type Props = {
    categories: Pick<Category, 'id' | 'name' | 'type'>[];
    transaction?: Transaction;
    /** Prefills a new expense, e.g. the payment of a fixed bill or subscription. */
    payment?: RecurringExpense;
    trigger: ReactNode;
    /** Extra actions under the form, e.g. a delete button. */
    footer?: ReactNode;
};

export function TransactionDialog({
    categories,
    transaction,
    payment,
    trigger,
    footer,
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {payment
                            ? `Registrar pago · ${payment.name}`
                            : transaction
                              ? 'Editar movimiento'
                              : 'Nuevo movimiento'}
                    </DialogTitle>
                </DialogHeader>
                <TransactionForm
                    categories={categories}
                    transaction={transaction}
                    payment={payment}
                    onSuccess={() => setOpen(false)}
                />
                {footer}
            </DialogContent>
        </Dialog>
    );
}

function TransactionForm({
    categories,
    transaction,
    payment,
    onSuccess,
}: Omit<Props, 'trigger' | 'footer'> & { onSuccess: () => void }) {
    const [type, setType] = useState<CategoryType>(
        transaction?.category.type ?? 'expense',
    );
    const [amount, setAmount] = useState(
        transaction?.amount ?? payment?.amount ?? '',
    );
    const [currency, setCurrency] = useState<Currency>(
        transaction?.currency ?? payment?.currency ?? 'COP',
    );
    const categoryId = transaction?.category_id ?? payment?.category_id;
    const today = new Date().toLocaleDateString('en-CA');

    return (
        <Form
            {...(transaction ? update.form(transaction.id) : store.form())}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
            className="space-y-4"
        >
            {({ processing, errors }) => (
                <>
                    {payment && (
                        <input
                            type="hidden"
                            name="recurring_expense_id"
                            value={payment.id}
                        />
                    )}
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        className="w-full"
                        value={type}
                        onValueChange={(value) =>
                            value && setType(value as CategoryType)
                        }
                    >
                        <ToggleGroupItem value="expense" className="flex-1">
                            Gasto
                        </ToggleGroupItem>
                        <ToggleGroupItem value="income" className="flex-1">
                            Ingreso
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            defaultValue={transaction?.title ?? payment?.name}
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Categoría</Label>
                        <Select
                            key={type}
                            name="category_id"
                            defaultValue={
                                categoryId &&
                                categories.some(
                                    (category) =>
                                        category.id === categoryId &&
                                        category.type === type,
                                )
                                    ? String(categoryId)
                                    : undefined
                            }
                        >
                            <SelectTrigger id="category_id" className="w-full">
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories
                                    .filter(
                                        (category) => category.type === type,
                                    )
                                    .map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid grid-cols-[1fr_7rem] gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Monto</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0.01"
                                required
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select
                                name="currency"
                                value={currency}
                                onValueChange={(value) =>
                                    setCurrency(value as Currency)
                                }
                            >
                                <SelectTrigger id="currency" className="w-full">
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
                        <p className="col-span-2 text-sm text-muted-foreground">
                            {amount ? formatMoney(amount, currency) : ' '}
                        </p>
                        <InputError
                            className="col-span-2"
                            message={errors.amount ?? errors.currency}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            required
                            max={today}
                            defaultValue={transaction?.date ?? today}
                        />
                        <InputError message={errors.date} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Guardar
                    </Button>
                </>
            )}
        </Form>
    );
}
