import { usePage } from '@inertiajs/react';

import AppLogoFull from '@/components/app-logo-full';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        // Wrapped: SidebarMenuButton forces direct svg children to size-4.
        <span className="flex items-center">
            <AppLogoIcon className="hidden size-8 shrink-0 group-data-[collapsible=icon]:block" />
            <AppLogoFull className="h-8 w-auto group-data-[collapsible=icon]:hidden" />
            <span className="sr-only">{name}</span>
        </span>
    );
}
