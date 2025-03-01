import InputError from '@/Components/InputError';
import { Button, Calendar, Input, Label, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/Components/ui';
import { cn, formatCurrencyInput } from '@/lib/utils';
import { Category } from '@/types/category';
import { Expense } from '@/types/expense';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CategoryFormProps {
    onClose?: () => void;
    category?: Category;
}

export default function CategoryForm({ onClose, category }: CategoryFormProps) {
    const [formattedBudget, setFormattedBudget] = useState(category ? formatCurrencyInput(String(category.budget)).formatted : '');

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
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        try {

            if (category) {
                put(route('category.update', category.id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        reset();
                        setFormattedBudget('');
                        toast.success('Categoria actualizada exitosamente');
                        onClose?.();
                    },
                    onError: (errors: any) => {
                        console.error('Error al actualizar el gasto', errors);
                        toast.error('Error al actualizar el gasto');
                    },
                });
            } else {
                post(route('expense.public-store'), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        reset();
                        setFormattedBudget('');
                        toast.success('Categoria guardada exitosamente');
                        onClose?.();
                    },
                    onError: (errors: any) => {
                        console.error('Error al guardar el gasto', errors);
                        toast.error('Error al guardar el gasto');
                    },
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error al procesar el formulario. Verifique los datos ingresados.');
        }
    }

    // Prevent scroll to top when dialog closes
    useEffect(() => {
        const handleScroll = (e: Event) => {
            if (!document.querySelector('[role="dialog"]')) {
                e.preventDefault();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: false });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                        const { formatted, raw } = formatCurrencyInput(e.target.value);
                        setFormattedBudget(formatted);
                        setData('budget', raw);
                    }}
                />
                <InputError message={errors.budget} />
            </div>

            <Button
                disabled={processing}
                className='w-full sm:w-auto'>
                {processing ? (category ? 'Actualizando...' : 'Agregando...') : (category ? 'Actualizar categoria' : 'Agregar categoria')}
            </Button>
        </form>
    );
}
