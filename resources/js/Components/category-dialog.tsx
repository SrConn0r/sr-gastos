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
import { Edit, Plus, Trash } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";
import CategoryForm from "./forms/category-form";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface CategoryDialogProps {
    categories: Category[];
    onClose: () => void;
}

export function CategoryDialog({ categories, onClose }: CategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [category, setCategory] = useState<Category | undefined>(undefined);

    useEffect(() => {
        if (category) {
            setCurrentCategory(category);
            setOpen(true);
        }
    }, [category]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            handleClose();
        }
    };

    const handleAddNew = () => {
        setCurrentCategory(undefined);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCategory(undefined);
        onClose();
    };

    const columns: ColumnDef<Category>[] = [
        {
            header: 'Nombre',
            accessorKey: 'name',
        },
        {
            header: 'Presupuesto',
            accessorKey: 'budget',
            meta: {
                centered: true,
            },
            cell: ({ row }) => {
                return (
                    row.original.budget
                        ? (row.original.budget)
                        : 'Sin presupuesto'
                );
            }
        },
        {
            header: 'Acciones',
            meta: {
                centered: true,
            },
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];
    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="md:mb-4 w-full md:w-fit" onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" /> Agregar Categoria
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{currentCategory ? 'Editar Categoria' : 'Agregar Categoria'}</DialogTitle>
                        <DialogDescription>
                            {currentCategory
                                ? 'Modifique el formulario para actualizar la categoria.'
                                : 'Complete el formulario para agregar una nueva categoria.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryForm
                        onClose={handleClose}
                        category={currentCategory}
                    />
                    <DataTable columns={columns} data={categories} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="mb-4" onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Categoria
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
                <DrawerHeader className="text-left">
                    <DrawerTitle>{currentCategory ? 'Editar Categoria' : 'Agregar Categoria'}</DrawerTitle>
                    <DrawerDescription>
                        {currentCategory
                            ? 'Modifique el formulario para actualizar la categoria.'
                            : 'Complete el formulario para agregar una nueva categoria.'
                        }
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-auto">
                    <CategoryForm
                        onClose={handleClose}
                        category={currentCategory}
                    />
                    <DataTable columns={columns} data={categories} />
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