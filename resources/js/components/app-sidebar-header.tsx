import { Link, usePage } from '@inertiajs/react';
import AppLogoFull from '@/components/app-logo-full';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, name } = usePage().props;

    return (
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 bg-background/70 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:static md:h-14 md:bg-transparent md:backdrop-blur-none">
            <div className="flex h-14 flex-1 items-center gap-2 md:hidden">
                <Link href={dashboard()} aria-label={name}>
                    <AppLogoFull className="h-9 w-auto" />
                </Link>
                {auth.user && (
                    <Link
                        href={editProfile()}
                        prefetch
                        className="ml-auto rounded-full"
                        aria-label="Mi perfil"
                    >
                        <UserInfo user={auth.user} avatarOnly />
                    </Link>
                )}
            </div>
            <div className="hidden items-center gap-2 md:flex">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
