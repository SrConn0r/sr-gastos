import { formatTotals } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { CurrencyTotal, Expense } from "@/types/expense";

interface CategoryTotal {
    id: number;
    name: string;
    totals: CurrencyTotal[];
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
                {/* <CardContent>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Desglose por categoría:</h3>
                        <div className="space-y-1">
                            {monthExpenseTotalByCategory.map((category) => (
                                <div key={category.id} className="flex justify-between items-center text-sm">
                                    <span>{category.name}</span>
                                    <span>{formatTotals(category.totals)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent> */}
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
                        <div className="space-y-2">
                            {monthExpenseTotalByCategory.map((category) => (
                                <div key={category.id} className="flex justify-between items-center text-sm">
                                    <span className="capitalize underline">{category.name}</span>
                                    <span>{formatTotals(category.totals)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}