import { Button, Card } from '@/Components/ui';
import { DataTable } from '@/Components/ui/data-table';
import { ExpenseDialog } from '@/Components/expense-dialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Expense } from '@/types/expense';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/types/category';
import { Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDateString } from '@/lib/utils';
import { CategoryDialog } from '@/Components/category-dialog';

export default function Dashboard({ expenses, categories }: PageProps<{ expenses: Expense[], categories: Category[] }>) {
    const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (expense: Expense) => {
        if (isDeleting) return;

        setIsDeleting(true);
        router.delete(route('expense.destroy', expense.id), {
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
                return new Intl.NumberFormat('es-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(row.original.amount);
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
                return <div className='flex gap-2 justify-center'>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedExpense(row.original)}>
                        <Edit className='w-4 h-4' />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => handleDelete(row.original)}>
                        <Trash className='w-4 h-4' />
                    </Button>
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

            <div className="py-12">
                <div className="mx-auto px-6 max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex gap-2 md:gap-4 w-full md:flex-row flex-col">
                        <ExpenseDialog
                            expense={selectedExpense}
                            categories={categories}
                            onClose={handleClose} />
                        <CategoryDialog
                            categories={categories}
                            onClose={handleClose} />
                    </div>
                    <Card className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <DataTable columns={columns} data={expenses} />
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
