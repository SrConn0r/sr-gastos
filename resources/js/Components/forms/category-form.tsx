import InputError from '@/Components/InputError';
import { Button, Input, Label, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/Components/ui';
import { CURRENCIES, Currency, formatCurrencyInput } from '@/lib/utils';
import { Category } from '@/types/category';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CategoryFormProps {
    onClose?: () => void;
    category?: Category;
}

export default function CategoryForm({ onClose, category }: CategoryFormProps) {
    const initialCurrency = category?.budget_currency || 'COP';
    const [formattedBudget, setFormattedBudget] = useState(category?.budget ? formatCurrencyInput(String(category.budget), initialCurrency).formatted : '');

    const {
        data,
        setData,
        errors,
        post,
        put,
        reset,
        processing,
    } = useForm({
        name: category?.name || '',
        budget: category?.budget || undefined as undefined | number,
        budget_currency: initialCurrency as Currency,
    });

    // Actualizar el formulario cuando cambia la categoría seleccionada
    useEffect(() => {
        if (category) {
            setData('name', category.name);
            setData('budget', category.budget);
            setData('budget_currency', category.budget_currency);
            setFormattedBudget(category.budget ? formatCurrencyInput(String(category.budget), category.budget_currency).formatted : '');
        } else {
            reset();
            setFormattedBudget('');
        }
    }, [category]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        try {
            if (category) {
                put(route('categories.update', category.id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        reset();
                        setFormattedBudget('');
                        toast.success('Categoria actualizada exitosamente');
                        onClose?.();
                    },
                    onError: (errors: any) => {
                        console.error('Error al actualizar la categoria', errors);
                        toast.error('Error al actualizar la categoria');
                    },
                });
            } else {
                post(route('categories.store'), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        reset();
                        setFormattedBudget('');
                        toast.success('Categoria guardada exitosamente');
                        onClose?.();
                    },
                    onError: (errors: any) => {
                        console.error('Error al guardar la categoria', errors);
                        toast.error('Error al guardar la categoria');
                    },
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error al procesar el formulario. Verifique los datos ingresados.');
        }
    }

    return (
        <form className='w-full space-y-6' onSubmit={handleSubmit}>
            <div>
                <Label>Nombre</Label>
                <Input
                    value={data.name}
                    placeholder="Ingrese el nombre"
                    onChange={(e) => setData('name', e.target.value)}
                />
                <InputError message={errors.name} />
            </div>

            <div>
                <Label>Presupuesto (opcional)</Label>
                <Input
                    type='text'
                    placeholder="Ingrese el presupuesto"
                    value={formattedBudget}
                    onChange={(e) => {
                        const { formatted, raw } = formatCurrencyInput(e.target.value, data.budget_currency);
                        setFormattedBudget(formatted);
                        setData('budget', raw);
                    }}
                />
                <InputError message={errors.budget} />
            </div>

            <div>
                <Label>Moneda del presupuesto</Label>
                <Select
                    value={data.budget_currency}
                    onValueChange={(value) => {
                        const currency = value as Currency;
                        setData('budget_currency', currency);
                        if (data.budget != null) {
                            setFormattedBudget(formatCurrencyInput(String(data.budget), currency).formatted);
                        }
                    }}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Moneda</SelectLabel>
                            {CURRENCIES.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <InputError message={errors.budget_currency} />
            </div>

            <Button
                disabled={processing}
                className='w-full sm:w-auto'>
                {processing ? (category ? 'Actualizando...' : 'Agregando...') : (category ? 'Actualizar categoria' : 'Agregar categoria')}
            </Button>
        </form>
    );
}
