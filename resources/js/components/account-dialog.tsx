import { Form } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { CURRENCIES } from '@/lib/utils';
import { store, update } from '@/routes/accounts';
import type { Account } from '@/types';

export const ACCOUNT_KINDS = {
    deposit: 'Cuenta',
    credit_card: 'Tarjeta de crédito',
} as const;

type Props = {
    account?: Account;
    trigger: ReactNode;
    /** Extra actions under the form, e.g. a delete button. */
    footer?: ReactNode;
};

export function AccountDialog({ account, trigger, footer }: Props) {
    const [open, setOpen] = useState(false);
    const [archived, setArchived] = useState(account?.archived_at != null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {account ? 'Editar cuenta' : 'Nueva cuenta'}
                    </DialogTitle>
                </DialogHeader>
                <Form
                    {...(account ? update.form(account.id) : store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="BBVA Ahorros"
                                    defaultValue={account?.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="institution">Banco</Label>
                                <Input
                                    id="institution"
                                    name="institution"
                                    required
                                    placeholder="BBVA"
                                    defaultValue={account?.institution}
                                />
                                <InputError message={errors.institution} />
                            </div>

                            <div className="grid grid-cols-[1fr_7rem] gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="kind">Tipo</Label>
                                    <Select
                                        name="kind"
                                        defaultValue={
                                            account?.kind ?? 'deposit'
                                        }
                                    >
                                        <SelectTrigger
                                            id="kind"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ACCOUNT_KINDS).map(
                                                ([value, label]) => (
                                                    <SelectItem
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Moneda</Label>
                                    <Select
                                        name="currency"
                                        defaultValue={
                                            account?.currency ?? 'COP'
                                        }
                                    >
                                        <SelectTrigger
                                            id="currency"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((code) => (
                                                <SelectItem
                                                    key={code}
                                                    value={code}
                                                >
                                                    {code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError
                                    className="col-span-2"
                                    message={errors.kind ?? errors.currency}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last4">
                                    Últimos 4 dígitos (opcional)
                                </Label>
                                <Input
                                    id="last4"
                                    name="last4"
                                    inputMode="numeric"
                                    maxLength={4}
                                    pattern="\d{4}"
                                    defaultValue={account?.last4 ?? ''}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Ayudan a reconocer la cuenta en los correos
                                    del banco.
                                </p>
                                <InputError message={errors.last4} />
                            </div>

                            {account && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="archived"
                                        value={archived ? '1' : '0'}
                                    />
                                    <Checkbox
                                        id="archived"
                                        checked={archived}
                                        onCheckedChange={(value) =>
                                            setArchived(value === true)
                                        }
                                    />
                                    <Label htmlFor="archived">Archivada</Label>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Guardar
                            </Button>
                        </>
                    )}
                </Form>
                {footer}
            </DialogContent>
        </Dialog>
    );
}
