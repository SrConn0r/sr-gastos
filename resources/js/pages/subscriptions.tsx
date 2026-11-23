import { RecurringPage } from '@/components/recurring-page';
import type { RecurringPageProps } from '@/components/recurring-page';
import { index } from '@/routes/subscriptions';

export default function Subscriptions(props: RecurringPageProps) {
    return <RecurringPage kind="subscription" {...props} />;
}

Subscriptions.layout = {
    breadcrumbs: [{ title: 'Suscripciones', href: index() }],
};
