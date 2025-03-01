import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/Components/ui/drawer";
import { Category } from "@/types/category";
import { Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";
import ExpenseForm from "./forms/expense-form";
import { Expense } from "@/types/expense";

interface ExpenseDialogProps {
    expense?: Expense;
    categories: Category[];
    onClose: () => void;
}

export function ExpenseDialog({ categories, expense, onClose }: ExpenseDialogProps) {
    const [open, setOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState<Expense | undefined>(undefined);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    useEffect(() => {
        if (expense) {
            setCurrentExpense(expense);
            setOpen(true);
        }
    }, [expense]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            handleClose();
        }
    };

    const handleAddNew = () => {
        setCurrentExpense(undefined);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentExpense(undefined);
        onClose();
    };

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button className="md:mb-4 w-full md:w-fit " onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" /> Agregar Gasto
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{currentExpense ? 'Editar Gasto' : 'Agregar Gasto'}</DialogTitle>
                        <DialogDescription>
                            {currentExpense 
                                ? 'Modifique el formulario para actualizar el gasto.'
                                : 'Complete el formulario para agregar un nuevo gasto.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <ExpenseForm 
                        categories={categories} 
                        onClose={handleClose} 
                        expense={currentExpense} 
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <Button className="mb-4" onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Gasto
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{currentExpense ? 'Editar Gasto' : 'Agregar Gasto'}</DrawerTitle>
                    <DrawerDescription>
                        {currentExpense 
                            ? 'Modifique el formulario para actualizar el gasto.'
                            : 'Complete el formulario para agregar un nuevo gasto.'
                        }
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-auto">
                    <ExpenseForm 
                        categories={categories} 
                        onClose={handleClose} 
                        expense={currentExpense} 
                    />
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">
                            Cancelar
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
} 