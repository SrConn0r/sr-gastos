import { formatCurrencyInput } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Expense } from "@/types/expense";

// Definir la interfaz para el total de gastos por categoría
interface CategoryTotal {
    id: number;
    name: string;
    total: number;
}

export default function MonthExpenseTotal({ 
    monthExpenseTotal, 
    monthExpenseTotalCategories,
    monthExpenseTotalByCategory 
}: { 
    monthExpenseTotal: number, 
    monthExpenseTotalCategories: Expense[],
    monthExpenseTotalByCategory: CategoryTotal[]
}) {

    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Card>
                <CardHeader className="py-4 md:w-fit w-full">
                    <CardTitle>Total de Gastos del Mes: <span className="font-normal ml-auto">{formatCurrencyInput(monthExpenseTotal.toString()).formatted}</span></CardTitle>
                </CardHeader>
                {/* <CardContent>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Desglose por categoría:</h3>
                        <div className="space-y-1">
                            {monthExpenseTotalByCategory.map((category) => (
                                <div key={category.id} className="flex justify-between items-center text-sm">
                                    <span>{category.name}</span>
                                    <span>{formatCurrencyInput(category.total.toString()).formatted}</span>
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
                <AccordionTrigger className="py-0 border-b-1 border-gray-600">Total de Gastos del Mes: <span className="font-normal ml-auto">{formatCurrencyInput(monthExpenseTotal.toString()).formatted}</span></AccordionTrigger>
                <AccordionContent className="py-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Desglose por categoría:</h3>
                        <div className="space-y-1">
                            {monthExpenseTotalByCategory.map((category) => (
                                <div key={category.id} className="flex justify-between items-center text-sm">
                                    <span>{category.name}</span>
                                    <span>{formatCurrencyInput(category.total.toString()).formatted}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}