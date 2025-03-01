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

interface ExpenseFormProps {
    categories: Category[];
    onClose?: () => void;
    expense?: Expense;
}

export default function ExpenseForm({ categories, onClose, expense }: ExpenseFormProps) {
    const [formattedAmount, setFormattedAmount] = useState(expense ? formatCurrencyInput(String(expense.amount)).formatted : '');
    const [selectedCategory, setSelectedCategory] = useState<string>(expense?.category.id ? String(expense.category.id) : '');

    // Get initial date from expense or today
    const getInitialDate = () => {
        if (expense?.expense_date) {
            // Handle ISO date with timezone
            let dateStr = String(expense.expense_date);
            if (dateStr.includes('T')) {
                dateStr = dateStr.split('T')[0];
            }

            // Create a date object from the clean date string
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day, 12, 0, 0);
            return date;
        }
        return new Date();
    };

    const {
        data,
        setData,
        errors,
        post,
        put,
        reset,
        processing,
    } = useForm({
        title: expense?.title || '',
        category_id: expense?.category.id || undefined as undefined | number,
        amount: expense?.amount || undefined as undefined | number,
        expense_date: getInitialDate(),
    });

    const today = new Date();

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        try {
            // Format date as YYYY-MM-DD for submission
            const formattedDate = format(data.expense_date, 'yyyy-MM-dd');

            // Update the form data with the formatted date
            setData('expense_date', formattedDate as any);

            if (expense) {
                put(route('expense.update', expense.id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        reset();
                        setFormattedAmount('');
                        setSelectedCategory('');
                        setData('category_id', undefined);
                        toast.success('Gasto actualizado exitosamente');
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
                        setFormattedAmount('');
                        setSelectedCategory('');
                        setData('category_id', undefined);
                        toast.success('Gasto guardado exitosamente');
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
                <Label>Titulo</Label>
                <Input
                    value={data.title}
                    placeholder="Ingrese el titulo"
                    onChange={(e) => setData('title', e.target.value)}
                />
                <InputError message={errors.title} />
            </div>
            <div>
                <Label>Categoria</Label>
                <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                        setSelectedCategory(value);
                        setData('category_id', Number(value));
                    }}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar Categoria" />
                    </SelectTrigger>
                    <SelectContent className='w-full'>
                        <SelectGroup>
                            <SelectLabel>Categoria</SelectLabel>
                            {categories.length > 0 && categories.map(cat => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <InputError message={errors.category_id} />
            </div>
            <div>
                <Label>Valor</Label>
                <Input
                    type='text'
                    placeholder="Ingrese el monto"
                    value={formattedAmount}
                    onChange={(e) => {
                        const { formatted, raw } = formatCurrencyInput(e.target.value);
                        setFormattedAmount(formatted);
                        setData('amount', raw);
                    }}
                />
                <InputError message={errors.amount} />
            </div>
            <div>
                <Label>Fecha</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !data.expense_date && "text-muted-foreground"
                            )}
                        >
                            {data.expense_date ? (
                                format(data.expense_date, 'dd/MM/yyyy')
                            ) : (
                                <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={data.expense_date}
                            onSelect={(date: Date | undefined) => {
                                if (date) {
                                    setData("expense_date", date);
                                }
                            }}
                            disabled={(date) =>
                                date > today || date < new Date("1900-01-01")
                            }
                            defaultMonth={data.expense_date}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <InputError message={errors.expense_date} />
            </div>

            <Button
                disabled={processing}
                className='w-full sm:w-auto'>
                {processing ? (expense ? 'Actualizando...' : 'Agregando...') : (expense ? 'Actualizar gasto' : 'Agregar gasto')}
            </Button>
        </form>
    );
}
