import { Button, Card } from '@/Components/ui';
import { DataTable } from '@/Components/ui/data-table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Expense } from '@/types/expense';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

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
    },
    {
        header: 'Fecha',
        accessorKey: 'expense_date',
        meta: {
            centered: true,
        },
        cell: ({ row }) => {
            return <span>{format(row.original.expense_date, 'dd/MM/yyyy')}</span>
        }
    },
    {
        header: 'Categoría',
        accessorKey: 'category.name',
        meta: {
            centered: true,
        },
    },
];

export default function Dashboard({ expenses }: PageProps<{ expenses: Expense[] }>) {
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
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Button className='mb-4'>Agregar Gasto</Button>
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
