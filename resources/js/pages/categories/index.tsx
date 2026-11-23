import { Head, router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { CategoryDialog } from '@/components/category-dialog';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/utils';
import { destroy, index } from '@/routes/categories';
import type { Category } from '@/types';

const SECTIONS = [
    { type: 'expense', title: 'Gastos' },
    { type: 'income', title: 'Ingresos' },
] as const;

export default function Categories({ categories }: { categories: Category[] }) {
    return (
        <>
            <Head title="Categorías" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Categorías"
                        description="Organiza tus gastos e ingresos y define presupuestos mensuales"
                    />
                    <CategoryDialog
                        trigger={
                            <Button>
                                <Plus /> Nueva
                            </Button>
                        }
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {SECTIONS.map((section) => (
                        <Card key={section.type}>
                            <CardHeader>
                                <CardTitle>{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {categories
                                    .filter(
                                        (category) =>
                                            category.type === section.type,
                                    )
                                    .map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center gap-2 py-2"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {category.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        category.transactions_count
                                                    }{' '}
                                                    movimientos
                                                    {category.budget !== null &&
                                                        ` · Presupuesto ${formatMoney(category.budget, category.budget_currency)}`}
                                                </p>
                                            </div>
                                            <CategoryDialog
                                                category={category}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Editar categoría"
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                }
                                            />
                                            <ConfirmDelete
                                                label="Eliminar categoría"
                                                description="Solo se pueden eliminar categorías sin movimientos."
                                                onConfirm={() =>
                                                    router.delete(
                                                        destroy.url(
                                                            category.id,
                                                        ),
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

Categories.layout = {
    breadcrumbs: [{ title: 'Categorías', href: index() }],
};
