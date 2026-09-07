import InputError from '@/Components/InputError';
import { Button, Calendar, Input, Label, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/Components/ui';
import { cn, CURRENCIES, Currency, formatCurrencyInput } from '@/lib/utils';
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
    const [formattedAmount, setFormattedAmount] = useState(expense ? formatCurrencyInput(String(expense.amount), expense.currency).formatted : '');
    const [selectedCategory, setSelectedCategory] = useState<string>(expense?.category.id ? String(expense.category.id) : '');

    const initialDate = expense?.expense_date.slice(0, 10) ?? format(new Date(), 'yyyy-MM-dd');

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
        currency: (expense?.currency || 'COP') as Currency,
        expense_date: initialDate,
    });

    const today = new Date();

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setFormattedAmount('');
                setSelectedCategory('');
                setData('category_id', undefined);
                setData('currency', 'COP');
                toast.success(expense ? 'Gasto actualizado exitosamente' : 'Gasto guardado exitosamente');
                onClose?.();
            },
            onError: () => {
                toast.error(expense ? 'Error al actualizar el gasto' : 'Error al guardar el gasto');
            },
        };

        if (expense) {
            put(route('expenses.update', expense.id), options);
        } else {
            post(route('expenses.store'), options);
        }
    };

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
            <div className="flex gap-3">
                <div className="flex-1">
                    <Label>Valor</Label>
                    <Input
                        type='text'
                        placeholder="Ingrese el monto"
                        value={formattedAmount}
                        onChange={(e) => {
                            const { formatted, raw } = formatCurrencyInput(e.target.value, data.currency);
                            setFormattedAmount(formatted);
                            setData('amount', raw);
                        }}
                    />
                    <InputError message={errors.amount} />
                </div>
                <div className="w-40">
                    <Label>Moneda</Label>
                    <Select
                        value={data.currency}
                        onValueChange={(value) => {
                            const currency = value as Currency;
                            setData('currency', currency);
                            if (data.amount != null) {
                                setFormattedAmount(formatCurrencyInput(String(data.amount), currency).formatted);
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
                    <InputError message={errors.currency} />
                </div>
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
                                format(new Date(`${data.expense_date}T12:00:00`), 'dd/MM/yyyy')
                            ) : (
                                <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={data.expense_date ? new Date(`${data.expense_date}T12:00:00`) : undefined}
                            onSelect={(date: Date | undefined) => {
                                if (date) {
                                    setData('expense_date', format(date, 'yyyy-MM-dd'));
                                }
                            }}
                            disabled={(date) =>
                                date > today || date < new Date("1900-01-01")
                            }
                            defaultMonth={data.expense_date ? new Date(`${data.expense_date}T12:00:00`) : undefined}
                            autoFocus
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
