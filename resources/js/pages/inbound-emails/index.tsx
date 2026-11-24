import { Head, Link, router } from '@inertiajs/react';
import { Mail, RotateCcw } from 'lucide-react';
import Heading from '@/components/heading';
import { ListRow } from '@/components/list-row';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatMoney } from '@/lib/utils';
import { index, retry } from '@/routes/inbound-emails';
import type { InboundEmail, InboundEmailStatus, Paginated } from '@/types';

const STATUS: Record<InboundEmailStatus, string> = {
    pending: 'Pendiente',
    recorded: 'Registrado',
    internal_transfer: 'Transferencia interna',
    ignored: 'Ignorado',
    failed: 'Fallido',
};

type Props = {
    emails: Paginated<InboundEmail>;
    filters: { status?: InboundEmailStatus };
};

export default function InboundEmails({ emails, filters }: Props) {
    return (
        <>
            <Head title="Correos" />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
                <Heading
                    title="Correos"
                    description="Notificaciones bancarias recibidas y lo que la IA hizo con cada una"
                />

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={filters.status ? 'outline' : 'ink'}
                        size="sm"
                        asChild
                    >
                        <Link href={index()}>Todos</Link>
                    </Button>
                    {Object.entries(STATUS).map(([value, label]) => (
                        <Button
                            key={value}
                            variant={
                                filters.status === value ? 'ink' : 'outline'
                            }
                            size="sm"
                            asChild
                        >
                            <Link href={index({ query: { status: value } })}>
                                {label}
                            </Link>
                        </Button>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    {emails.data.map((email) => (
                        <ListRow
                            key={email.id}
                            icon={<Mail />}
                            title={email.subject || email.from}
                            subtitle={[
                                formatDate(email.received_at.slice(0, 10)),
                                email.ai_result?.reason ?? email.error,
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                            value={
                                <span className="flex flex-col items-end gap-1">
                                    <Badge
                                        variant={
                                            email.status === 'failed'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                    >
                                        {STATUS[email.status]}
                                    </Badge>
                                    {email.transaction && (
                                        <span className="text-sm font-semibold">
                                            {formatMoney(
                                                email.transaction.amount,
                                                email.transaction.currency,
                                            )}
                                        </span>
                                    )}
                                </span>
                            }
                            action={
                                email.status === 'failed' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Reintentar"
                                        onClick={() =>
                                            router.post(
                                                retry.url(email.id),
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <RotateCcw />
                                    </Button>
                                )
                            }
                        />
                    ))}
                    {emails.data.length === 0 && (
                        <p className="py-16 text-center text-muted-foreground">
                            Aún no llegan correos.
                        </p>
                    )}
                </div>

                {emails.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant="outline"
                            disabled={!emails.prev_page_url}
                            onClick={() =>
                                emails.prev_page_url &&
                                router.visit(emails.prev_page_url)
                            }
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {emails.current_page} de {emails.last_page}
                        </span>
                        <Button
                            variant="outline"
                            disabled={!emails.next_page_url}
                            onClick={() =>
                                emails.next_page_url &&
                                router.visit(emails.next_page_url)
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

InboundEmails.layout = {
    breadcrumbs: [{ title: 'Correos', href: index() }],
};
