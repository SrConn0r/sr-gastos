import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { CategoryDialog } from '@/components/category-dialog';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import { ListLabel, ListRow } from '@/components/list-row';
import { Button } from '@/components/ui/button';
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
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
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
                        <section
                            key={section.type}
                            className="flex flex-col gap-2"
                        >
                            <ListLabel>{section.title}</ListLabel>
                            {categories
                                .filter(
                                    (category) =>
                                        category.type === section.type,
                                )
                                .map((category) => (
                                    <CategoryDialog
                                        key={category.id}
                                        category={category}
                                        footer={
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
                                        }
                                        trigger={
                                            <ListRow
                                                icon={category.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                title={category.name}
                                                subtitle={`${category.transactions_count} movimientos`}
                                                value={
                                                    category.budget !==
                                                        null && (
                                                        <>
                                                            <span className="block text-xs text-muted-foreground">
                                                                Presupuesto
                                                            </span>
                                                            <span className="font-semibold">
                                                                {formatMoney(
                                                                    category.budget,
                                                                    category.budget_currency,
                                                                )}
                                                            </span>
                                                        </>
                                                    )
                                                }
                                            />
                                        }
                                    />
                                ))}
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}

Categories.layout = {
    breadcrumbs: [{ title: 'Categorías', href: index() }],
};
