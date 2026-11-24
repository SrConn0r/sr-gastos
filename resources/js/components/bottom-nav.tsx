import { Link } from '@inertiajs/react';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { MOBILE_TABS, mainNavItems } from '@/components/app-sidebar';
import { LinkRow } from '@/components/list-row';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

const tabs = mainNavItems.slice(0, MOBILE_TABS);
const more = mainNavItems.slice(MOBILE_TABS);

const tabClass = (active: boolean) =>
    cn(
        'flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors [&_svg]:size-5',
        active
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground',
    );

export function BottomNav() {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const [open, setOpen] = useState(false);
    const moreActive = more.some((item) => isCurrentOrParentUrl(item.href));

    return (
        <nav
            aria-label="Navegación principal"
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
        >
            <ul className="mx-auto flex max-w-sm items-center gap-1 rounded-full border bg-card/90 p-1.5 shadow-soft backdrop-blur-xl">
                {tabs.map((item) => {
                    const active = isCurrentOrParentUrl(item.href);

                    return (
                        <li key={item.title} className="flex-1">
                            <Link
                                href={item.href}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                className={tabClass(active)}
                            >
                                {item.icon && <item.icon />}
                                {item.title}
                            </Link>
                        </li>
                    );
                })}
                <li className="flex-1">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger className={tabClass(moreActive)}>
                            <Ellipsis />
                            Más
                        </SheetTrigger>
                        <SheetContent
                            side="bottom"
                            className="gap-2 bg-background px-4"
                        >
                            <SheetHeader className="px-1 pb-0">
                                <SheetTitle>Más</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Otras secciones de la app
                                </SheetDescription>
                            </SheetHeader>
                            <ul className="flex flex-col gap-2 pb-6">
                                {more.map((item) => (
                                    <li key={item.title}>
                                        <LinkRow
                                            href={item.href}
                                            icon={item.icon && <item.icon />}
                                            title={item.title}
                                            active={isCurrentOrParentUrl(
                                                item.href,
                                            )}
                                            onClick={() => setOpen(false)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </SheetContent>
                    </Sheet>
                </li>
            </ul>
        </nav>
    );
}
