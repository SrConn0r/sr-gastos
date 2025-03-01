import { Button, Card, CardContent, CardHeader, CardTitle } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps } from '@/types';
import { Category } from '@/types/category';
import { Head, Link } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import ExpenseForm from '@/Components/forms/expense-form';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    categories,
    message,
}: PageProps<{ laravelVersion: string; phpVersion: string, categories: Category[], message: string }>) {
    return (
        <GuestLayout>
            <Head title="SrGastos" />
            <div className='flex flex-col items-center justify-center h-screen w-full p-8 md:px-16'>
                <header className='flex w-full justify-between items-center'>
                    <div></div>
                    <img src="assets/images/sr-connor.svg" alt="Logo" width={180} />
                    <div>
                        <Link href='/login'>
                            <Button variant="outline">
                                Login <LogIn />
                            </Button>
                        </Link>
                    </div>
                </header>
                <main className='flex flex-col items-center justify-center h-full w-full md:w-2/4'>
                    <Card className='w-full md:max-w-[600px]'>
                        <CardHeader>
                            <CardTitle>Agregar Gasto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ExpenseForm categories={categories} />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </GuestLayout>
    );
}
