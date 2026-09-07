import { formatMoney, formatTotals } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { CurrencyTotal, Expense } from "@/types/expense";

interface CategoryTotal {
    id: number;
    name: string;
    budget: number | null;
    budget_currency: Expense['currency'];
    budget_spent: number;
    remaining_budget: number | null;
    totals: CurrencyTotal[];
}

function CategoryBreakdown({ categories }: { categories: CategoryTotal[] }) {
    return (
        <div className="space-y-2">
            {categories.map((category) => (
                <div key={category.id} className="text-sm">
                    <div className="flex justify-between items-center">
                        <span className="capitalize">{category.name}</span>
                        <span>{formatTotals(category.totals)}</span>
                    </div>
                    {category.budget !== null && (
                        <div className="text-xs text-muted-foreground">
                            Presupuesto: {formatMoney(category.budget_spent, category.budget_currency)} / {formatMoney(category.budget, category.budget_currency)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function MonthExpenseTotal({ 
    monthExpenseTotal, 
    monthExpenseTotalByCategory 
}: { 
    monthExpenseTotal: CurrencyTotal[], 
    monthExpenseTotalCategories: Expense[],
    monthExpenseTotalByCategory: CategoryTotal[]
}) {

    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Card>
                <CardHeader className="py-4 md:w-fit w-full">
                    <CardTitle>Total de Gastos del Mes: <span className="font-normal ml-auto">{formatTotals(monthExpenseTotal)}</span></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Desglose por categoría:</h3>
                        <CategoryBreakdown categories={monthExpenseTotalByCategory} />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="month-expense-total" className="bg-background rounded-xl p-4 shadow-sm">
                <AccordionTrigger className="py-0 border-b-1 border-gray-600">Total de Gastos del Mes: <span className="font-normal ml-auto">{formatTotals(monthExpenseTotal)}</span></AccordionTrigger>
                <AccordionContent className="py-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Desglose por categoría:</h3>
                        <CategoryBreakdown categories={monthExpenseTotalByCategory} />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
