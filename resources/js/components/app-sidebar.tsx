import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    CalendarClock,
    House,
    Landmark,
    LayoutGrid,
    Mail,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as accounts } from '@/routes/accounts';
import { index as categories } from '@/routes/categories';
import { index as fixedExpenses } from '@/routes/fixed-expenses';
import { index as inboundEmails } from '@/routes/inbound-emails';
import { index as subscriptions } from '@/routes/subscriptions';
import { index as transactions } from '@/routes/transactions';
import type { NavItem } from '@/types';

/** The first MOBILE_TABS items are bottom-nav tabs; the rest go under "Más". */
export const mainNavItems: NavItem[] = [
    { title: 'Inicio', href: dashboard(), icon: LayoutGrid },
    { title: 'Movimientos', href: transactions(), icon: ArrowLeftRight },
    { title: 'Cuentas', href: accounts(), icon: Landmark },
    { title: 'Gastos fijos', href: fixedExpenses(), icon: House },
    { title: 'Suscripciones', href: subscriptions(), icon: CalendarClock },
    { title: 'Categorías', href: categories(), icon: Tags },
    { title: 'Correos', href: inboundEmails(), icon: Mail },
];

export const MOBILE_TABS = 3;

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
