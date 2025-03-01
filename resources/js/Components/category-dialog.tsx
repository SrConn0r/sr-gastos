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
import { ClipboardList, Edit, List, Loader2, Plus, Trash } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";
import CategoryForm from "./forms/category-form";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { formatCurrencyInput } from "@/lib/utils";

interface CategoryDialogProps {
    categories: Category[];
    onClose: () => void;
}

export function CategoryDialog({ categories, onClose }: CategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDelete = (category: Category) => {
        if (isDeleting) return;

        setIsDeleting(true);
        router.delete(route('category.destroy', category.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Categoria eliminada exitosamente');
                setIsDeleting(false);
            },
            onError: () => {
                toast.error('Error al eliminar el gasto');
                setIsDeleting(false);
            }
        });
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
                        ? <span className="text-right">{formatCurrencyInput(row.original.budget.toString()).formatted}</span>
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
                    <div className="flex gap-2 sm:justify-center justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                setCurrentCategory(row.original);
                                setOpen(true);
                            }}>
                            <Edit className="h-4 w-4" />
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
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría y sus datos.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(row.original)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            }
        }
    ];

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full md:w-fit" onClick={handleAddNew}>
                        <ClipboardList className="mr-2 h-4 w-4" /> Gestionar Categorias
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
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
                    {
                        isDeleting
                            ? <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin" />
                            </div>
                            : <DataTable columns={columns} data={categories} />
                    }
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <Button variant="outline" onClick={handleAddNew}>
                    <ClipboardList className="mr-2 h-4 w-4" /> Gestionar Categorias
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
                <div className="px-4 pb-0 overflow-auto">
                    <CategoryForm
                        onClose={handleClose}
                        category={currentCategory}
                    />
                    {
                        isDeleting
                            ? <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin" />
                            </div>
                            : <DataTable columns={columns} data={categories} />
                    }
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