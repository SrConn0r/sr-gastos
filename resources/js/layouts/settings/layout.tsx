import { Link } from '@inertiajs/react';
import { ChevronLeft, Palette, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Perfil', href: edit(), icon: UserRound },
    { title: 'Seguridad', href: editSecurity(), icon: ShieldCheck },
    { title: 'Apariencia', href: editAppearance(), icon: Palette },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const onProfile = isCurrentOrParentUrl(edit());

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:py-6">
            {/* On mobile the profile page links to the other settings pages. */}
            {!onProfile && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 md:hidden"
                    asChild
                >
                    <Link href={edit()}>
                        <ChevronLeft /> Perfil
                    </Link>
                </Button>
            )}

            <div className="hidden md:block">
                <Heading
                    title="Ajustes"
                    description="Administra tu perfil y tu cuenta"
                />
            </div>

            <div className="flex flex-col lg:flex-row lg:gap-12">
                <aside className="mb-6 hidden w-full md:block lg:w-48">
                    <nav className="flex flex-col gap-1" aria-label="Ajustes">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={toUrl(item.href)}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && <item.icon />}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 md:max-w-2xl">
                    <section className="flex max-w-xl flex-col gap-4 md:gap-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
