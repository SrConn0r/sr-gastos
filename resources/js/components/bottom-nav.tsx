import { Link } from '@inertiajs/react';
import { mainNavItems } from '@/components/app-sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="Navegación principal"
            className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
        >
            <ul className="flex max-w-full items-center gap-1 rounded-full border bg-card/90 p-1.5 shadow-soft backdrop-blur-xl">
                {mainNavItems.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <li
                            key={item.title}
                            className={cn(active && 'min-w-0')}
                        >
                            <Link
                                href={item.href}
                                prefetch
                                aria-label={item.title}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors',
                                    active
                                        ? 'bg-foreground px-4 text-background'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {item.icon && (
                                    <item.icon className="size-5 shrink-0" />
                                )}
                                {active && (
                                    <span className="truncate">
                                        {item.title}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
