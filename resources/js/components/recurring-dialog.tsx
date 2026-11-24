import { Form } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { CURRENCIES, MONTHS } from '@/lib/utils';
import { store, update } from '@/routes/recurring-expenses';
import type { Category, RecurringExpense, RecurringKind } from '@/types';

type Props = {
    kind: RecurringKind;
    categories: Pick<Category, 'id' | 'name'>[];
    item?: RecurringExpense;
    trigger: ReactNode;
    /** Extra actions under the form, e.g. a delete button. */
    footer?: ReactNode;
};

export function RecurringDialog({
    kind,
    categories,
    item,
    trigger,
    footer,
}: Props) {
    const [open, setOpen] = useState(false);
    const title = item
        ? `Editar ${kind === 'fixed' ? 'gasto fijo' : 'suscripción'}`
        : kind === 'fixed'
          ? 'Nuevo gasto fijo'
          : 'Nueva suscripción';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <RecurringForm
                    kind={kind}
                    categories={categories}
                    item={item}
                    onSuccess={() => setOpen(false)}
                />
                {footer}
            </DialogContent>
        </Dialog>
    );
}

function RecurringForm({
    kind,
    categories,
    item,
    onSuccess,
}: Omit<Props, 'trigger' | 'footer'> & { onSuccess: () => void }) {
    const [frequency, setFrequency] = useState(item?.frequency ?? 'monthly');

    return (
        <Form
            {...(item ? update.form(item.id) : store.form())}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
            className="space-y-4"
        >
            {({ processing, errors }) => (
                <>
                    <input type="hidden" name="kind" value={kind} />
                    <input type="hidden" name="frequency" value={frequency} />

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder={
                                kind === 'fixed' ? 'Arriendo' : 'Netflix'
                            }
                            defaultValue={item?.name}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Categoría</Label>
                        <Select
                            name="category_id"
                            defaultValue={
                                item ? String(item.category_id) : undefined
                            }
                        >
                            <SelectTrigger id="category_id" className="w-full">
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid grid-cols-[1fr_7rem] gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">
                                {kind === 'fixed'
                                    ? 'Monto aproximado'
                                    : 'Monto'}
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0.01"
                                required
                                defaultValue={item?.amount}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select
                                name="currency"
                                defaultValue={item?.currency ?? 'COP'}
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
                        <InputError
                            className="col-span-2"
                            message={errors.amount ?? errors.currency}
                        />
                    </div>

                    {kind === 'subscription' && (
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            className="w-full"
                            value={frequency}
                            onValueChange={(value) =>
                                value && setFrequency(value as typeof frequency)
                            }
                        >
                            <ToggleGroupItem value="monthly" className="flex-1">
                                Mensual
                            </ToggleGroupItem>
                            <ToggleGroupItem value="yearly" className="flex-1">
                                Anual
                            </ToggleGroupItem>
                        </ToggleGroup>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="day">
                                {kind === 'fixed'
                                    ? 'Día de pago'
                                    : 'Día de corte'}
                            </Label>
                            <Input
                                id="day"
                                name="day"
                                type="number"
                                min="1"
                                max="31"
                                required
                                defaultValue={item?.day}
                            />
                        </div>
                        {frequency === 'yearly' && (
                            <div className="grid gap-2">
                                <Label htmlFor="month">Mes</Label>
                                <Select
                                    name="month"
                                    defaultValue={
                                        item?.month
                                            ? String(item.month)
                                            : undefined
                                    }
                                >
                                    <SelectTrigger
                                        id="month"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Mes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((name, index) => (
                                            <SelectItem
                                                key={name}
                                                value={String(index + 1)}
                                            >
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <InputError
                            className="col-span-2"
                            message={
                                errors.day ?? errors.month ?? errors.frequency
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="active"
                            name="active"
                            value="1"
                            defaultChecked={item?.active ?? true}
                        />
                        <Label htmlFor="active">
                            {kind === 'fixed' ? 'Activo' : 'Activa'}
                        </Label>
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
