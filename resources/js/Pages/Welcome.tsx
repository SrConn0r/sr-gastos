import InputError from '@/Components/InputError';
import { Button, Calendar, Card, CardContent, CardHeader, CardTitle, Input, Label, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { cn, formatCurrencyInput } from '@/lib/utils';
import { PageProps } from '@/types';
import { Category } from '@/types/category';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarIcon, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    categories,
    message,
}: PageProps<{ laravelVersion: string; phpVersion: string, categories: Category[], message: string }>) {

    const [formattedAmount, setFormattedAmount] = useState('');

    const {
        data,
        setData,
        errors,
        post,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        title: '',
        category_id: undefined as undefined | number,
        amount: undefined as undefined | number,
        expense_date: new Date(),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const formattedData = {
            ...data,
            expense_date: format(data.expense_date, 'yyyy-MM-dd')
        };
        console.log(formattedData);
        post(route('expense.public-store'), {
            preserveScroll: true,
            onSuccess: (response) => {
                reset();
                setFormattedAmount('');
                setData('category_id', undefined);
                console.log(response);
                toast.success('Gasto guardado exitosamente');
            },
            onError: (err) => {
                console.error('Error al guardar el gasto', err);
                toast.error('Error al guardar el gasto');
            },
        });
    }

    return (
        <GuestLayout>
            <Head title="SrGastos" />
            <div className='flex flex-col items-center justify-center h-screen w-full p-8 md:px-16'>
                <header className='flex w-full justify-between items-center'>
                    <div></div>
                    <img src="assets/images/sr-connor.svg" alt="Logo" width={180} />
                    <div>
                        <Link href='/login'>
                            <Button variant="outline">
                                Login <LogIn />
                            </Button>
                        </Link>
                    </div>
                </header>
                <main className='flex flex-col items-center justify-center h-full w-full md:w-2/4'>
                    <Card className='w-full md:max-w-[600px]'>
                        <CardHeader>
                            <CardTitle>Agregar Gasto</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                    <Select onValueChange={(value) => {
                                        setData('category_id', Number(value))
                                    }} defaultValue={data.category_id ? String(data.category_id) : ''}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar Categoria" />
                                        </SelectTrigger>
                                        <SelectContent className='w-full'>
                                            <SelectGroup>
                                                <SelectLabel>Categoria</SelectLabel>
                                                {categories.length > 0 && categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
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
                                                    data.expense_date.toLocaleDateString()
                                                ) : (
                                                    <span>Pick a date</span>
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
                                                defaultMonth={today}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.expense_date} />
                                </div>

                                <Button
                                    disabled={processing}>
                                    {processing ? 'Agregando...' : 'Agregar gasto'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </GuestLayout>
    );
}
