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
import { CURRENCIES } from '@/lib/utils';
import { store, update } from '@/routes/categories';
import type { Category, CategoryType } from '@/types';

type Props = {
    category?: Category;
    trigger: ReactNode;
    /** Extra actions under the form, e.g. a delete button. */
    footer?: ReactNode;
};

export function CategoryDialog({ category, trigger, footer }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Editar categoría' : 'Nueva categoría'}
                    </DialogTitle>
                </DialogHeader>
                <CategoryForm
                    category={category}
                    onSuccess={() => setOpen(false)}
                />
                {footer}
            </DialogContent>
        </Dialog>
    );
}

function CategoryForm({
    category,
    onSuccess,
}: {
    category?: Category;
    onSuccess: () => void;
}) {
    const [type, setType] = useState<CategoryType>(category?.type ?? 'expense');

    return (
        <Form
            {...(category ? update.form(category.id) : store.form())}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
            className="space-y-4"
        >
            {({ processing, errors }) => (
                <>
                    {/* The type can't change once created. */}
                    <input type="hidden" name="type" value={type} />
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        className="w-full"
                        disabled={!!category}
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
                    <InputError message={errors.type} />

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            defaultValue={category?.name}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {type === 'expense' ? (
                        <div className="grid grid-cols-[1fr_7rem] gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="budget">
                                    Presupuesto mensual (opcional)
                                </Label>
                                <Input
                                    id="budget"
                                    name="budget"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min="0"
                                    defaultValue={category?.budget ?? ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="budget_currency">Moneda</Label>
                                <Select
                                    name="budget_currency"
                                    defaultValue={
                                        category?.budget_currency ?? 'COP'
                                    }
                                >
                                    <SelectTrigger
                                        id="budget_currency"
                                        className="w-full"
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
                            <InputError
                                className="col-span-2"
                                message={
                                    errors.budget ?? errors.budget_currency
                                }
                            />
                        </div>
                    ) : (
                        <input
                            type="hidden"
                            name="budget_currency"
                            value="COP"
                        />
                    )}

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
