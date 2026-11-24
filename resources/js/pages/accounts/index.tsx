import { Head, router } from '@inertiajs/react';
import { Landmark, Plus } from 'lucide-react';
import { ACCOUNT_KINDS, AccountDialog } from '@/components/account-dialog';
import { ConfirmDelete } from '@/components/confirm-delete';
import Heading from '@/components/heading';
import { ListLabel, ListRow } from '@/components/list-row';
import { Button } from '@/components/ui/button';
import { destroy, index } from '@/routes/accounts';
import type { Account } from '@/types';

export default function Accounts({ accounts }: { accounts: Account[] }) {
    const sections = [
        { title: 'Activas', items: accounts.filter((a) => !a.archived_at) },
        { title: 'Archivadas', items: accounts.filter((a) => a.archived_at) },
    ].filter((section) => section.items.length > 0);

    return (
        <>
            <Head title="Cuentas" />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Cuentas"
                        description="Bancos, billeteras y tarjetas donde entra y sale tu dinero"
                    />
                    <AccountDialog
                        trigger={
                            <Button>
                                <Plus /> Nueva
                            </Button>
                        }
                    />
                </div>

                {sections.map((section) => (
                    <section
                        key={section.title}
                        className="flex flex-col gap-2"
                    >
                        <ListLabel>{section.title}</ListLabel>
                        {section.items.map((account) => (
                            <AccountDialog
                                key={account.id}
                                account={account}
                                footer={
                                    <ConfirmDelete
                                        label="Eliminar cuenta"
                                        description="Solo se pueden eliminar cuentas sin movimientos; las demás se archivan."
                                        onConfirm={() =>
                                            router.delete(
                                                destroy.url(account.id),
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                    />
                                }
                                trigger={
                                    <ListRow
                                        icon={<Landmark />}
                                        title={account.name}
                                        subtitle={[
                                            account.institution,
                                            ACCOUNT_KINDS[account.kind],
                                            account.last4 &&
                                                `•••• ${account.last4}`,
                                            `${account.transactions_count} movimientos`,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                        value={
                                            <span className="text-sm font-semibold">
                                                {account.currency}
                                            </span>
                                        }
                                    />
                                }
                            />
                        ))}
                    </section>
                ))}

                {accounts.length === 0 && (
                    <p className="py-16 text-center text-muted-foreground">
                        Aún no tienes cuentas. Crea una por cada banco o
                        tarjeta.
                    </p>
                )}
            </div>
        </>
    );
}

Accounts.layout = {
    breadcrumbs: [{ title: 'Cuentas', href: index() }],
};
