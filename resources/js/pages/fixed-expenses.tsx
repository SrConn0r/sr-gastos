import { RecurringPage } from '@/components/recurring-page';
import type { RecurringPageProps } from '@/components/recurring-page';
import { index } from '@/routes/fixed-expenses';

export default function FixedExpenses(props: RecurringPageProps) {
    return <RecurringPage kind="fixed" {...props} />;
}

FixedExpenses.layout = {
    breadcrumbs: [{ title: 'Gastos fijos', href: index() }],
};
