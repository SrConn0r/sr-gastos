import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { BottomNav } from '@/components/bottom-nav';
import { usePage } from '@inertiajs/react';
import { DashboardSkeleton, ListSkeleton } from '@/components/page-skeletons';
import { PullToRefresh } from '@/components/pull-to-refresh';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { component } = usePage();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip pb-28 md:pb-0"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {/* Settings pages are forms: nothing to refresh there. */}
                {component.startsWith('settings/') ? (
                    children
                ) : (
                    <PullToRefresh
                        skeleton={
                            component === 'dashboard' ? (
                                <DashboardSkeleton />
                            ) : (
                                <ListSkeleton />
                            )
                        }
                    >
                        {children}
                    </PullToRefresh>
                )}
            </AppContent>
            <BottomNav />
        </AppShell>
    );
}
