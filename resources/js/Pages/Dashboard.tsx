import { Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui';
import { DataTable } from '@/Components/ui/data-table';
import { ExpenseDialog } from '@/Components/expense-dialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { CurrencyTotal, Expense, ExpenseFilters, ExpensePaginator } from '@/types/expense';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/types/category';
import { Download, Edit, Loader2, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CURRENCIES, Currency, formatDateString, formatMoney } from '@/lib/utils';
import { CategoryDialog } from '@/Components/category-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/Components/ui/alert-dialog';
import MonthExpenseTotal from '@/Components/widgets/month-expense-total';

// Definir la interfaz para el total de gastos por categoría
interface CategoryTotal {
    id: number;
    name: string;
    budget: number | null;
    budget_currency: Expense['currency'];
    budget_spent: number;
    remaining_budget: number | null;
    totals: CurrencyTotal[];
}

export default function Dashboard({ 
    expenses, 
    categories, 
    monthExpenseTotal, 
    monthExpenseTotalByCategory,
    filters,
}: PageProps<{ 
    expenses: ExpensePaginator,
    categories: Category[], 
    monthExpenseTotal: CurrencyTotal[],
    monthExpenseTotalByCategory: CategoryTotal[],
    filters: ExpenseFilters,
}>) {
    const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterValues, setFilterValues] = useState({
        search: filters.search ?? '',
        category: filters.category ? String(filters.category) : 'all',
        currency: filters.currency ?? 'all',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const filterQuery = () => ({
        search: filterValues.search || undefined,
        category: filterValues.category === 'all' ? undefined : Number(filterValues.category),
        currency: filterValues.currency === 'all' ? undefined : filterValues.currency as Currency,
        date_from: filterValues.date_from || undefined,
        date_to: filterValues.date_to || undefined,
    });

    const applyFilters = () => {
        router.get(route('dashboard'), filterQuery(), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', category: 'all', currency: 'all', date_from: '', date_to: '' };
        setFilterValues(emptyFilters);
        router.get(route('dashboard'), {}, { preserveScroll: true, replace: true });
    };

    const handleDelete = (expense: Expense) => {
        if (isDeleting) return;

        setIsDeleting(true);
        router.delete(route('expenses.destroy', expense.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Gasto eliminado exitosamente');
                setIsDeleting(false);
            },
            onError: () => {
                toast.error('Error al eliminar el gasto');
                setIsDeleting(false);
            }
        });
    };

    const columns: ColumnDef<Expense>[] = [
        {
            header: 'Título',
            accessorKey: 'title',
        },
        {
            header: 'Monto',
            accessorKey: 'amount',
            meta: {
                centered: true,
            },
            cell: ({ row }) => {
                return formatMoney(row.original.amount, row.original.currency);
            }
        },
        {
            header: 'Fecha',
            accessorKey: 'expense_date',
            meta: {
                centered: true,
            },
            cell: ({ row }) => {
                return <span>{formatDateString(String(row.original.expense_date))}</span>
            }
        },
        {
            header: 'Categoría',
            accessorKey: 'category.name',
            meta: {
                centered: true,
            },
        },
        {
            header: 'Acciones',
            accessorKey: 'actions',
            meta: {
                centered: true,
            },
            cell: ({ row }) => {
                return <div className='flex gap-2 sm:justify-center justify-end'>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedExpense(row.original)}>
                        <Edit className='w-4 h-4' />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Trash className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el gasto y sus datos.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive" onClick={() => handleDelete(row.original)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            }
        }
    ];

    const handleClose = () => {
        setSelectedExpense(undefined);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Inicio
                </h2>
            }
        >
            <Head title="Inicio" />

            <div className="py-6 md:py-12">
                <div className="mx-auto px-2 max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex gap-4 md:gap-4 w-full md:flex-row flex-col md:items-center mb-4">
                        <ExpenseDialog
                            expense={selectedExpense}
                            categories={categories}
                            onClose={handleClose} />
                        <CategoryDialog
                            categories={categories}
                            onClose={handleClose} />
                        <div className="md:ml-auto">
                            <MonthExpenseTotal
                                monthExpenseTotal={monthExpenseTotal}
                                monthExpenseTotalByCategory={monthExpenseTotalByCategory}
                            />
                        </div>
                    </div>
                    <Card className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form
                                className="flex flex-col gap-2 pb-4 lg:flex-row"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    applyFilters();
                                }}>
                                <Input
                                    placeholder="Buscar"
                                    value={filterValues.search}
                                    onChange={(event) => setFilterValues({ ...filterValues, search: event.target.value })}
                                />
                                <Select
                                    value={filterValues.category}
                                    onValueChange={(category) => setFilterValues({ ...filterValues, category })}>
                                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filterValues.currency}
                                    onValueChange={(currency) => setFilterValues({ ...filterValues, currency })}>
                                    <SelectTrigger><SelectValue placeholder="Moneda" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las monedas</SelectItem>
                                        {CURRENCIES.map((currency) => (
                                            <SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    aria-label="Fecha inicial"
                                    value={filterValues.date_from}
                                    onChange={(event) => setFilterValues({ ...filterValues, date_from: event.target.value })}
                                />
                                <Input
                                    type="date"
                                    aria-label="Fecha final"
                                    value={filterValues.date_to}
                                    onChange={(event) => setFilterValues({ ...filterValues, date_to: event.target.value })}
                                />
                                <Button type="submit">Filtrar</Button>
                                <Button type="button" variant="secondary" onClick={clearFilters}>Limpiar</Button>
                                <Button asChild type="button" variant="outline">
                                    <a href={route('expenses.export', filterQuery())}>
                                        <Download className="mr-2 h-4 w-4" /> CSV
                                    </a>
                                </Button>
                            </form>
                            {
                                isDeleting
                                    ? <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin" />
                                    </div>
                                    : <DataTable columns={columns} data={expenses.data} serverPagination showToolbar={false} />
                            }
                            <div className="flex items-center justify-center gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    disabled={!expenses.prev_page_url}
                                    onClick={() => expenses.prev_page_url && router.visit(expenses.prev_page_url)}>
                                    Anterior
                                </Button>
                                <span className="text-sm">Página {expenses.current_page} de {expenses.last_page}</span>
                                <Button
                                    variant="outline"
                                    disabled={!expenses.next_page_url}
                                    onClick={() => expenses.next_page_url && router.visit(expenses.next_page_url)}>
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
