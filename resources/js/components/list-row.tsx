import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<ComponentProps<'button'>, 'title' | 'value'> & {
    icon: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    value?: ReactNode;
    /** Rendered next to the tappable area (can't nest buttons inside it). */
    action?: ReactNode;
};

/** Tappable list item card: icon bubble, title/subtitle, trailing value. */
export function ListRow({
    icon,
    title,
    subtitle,
    value,
    action,
    className,
    ...props
}: Props) {
    return (
        <div
            className={cn(
                'flex items-center rounded-lg border border-transparent bg-card shadow-soft transition-colors has-[>button:first-child:hover]:bg-accent/40 dark:border-border dark:shadow-none',
                className,
            )}
        >
            <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-3 text-left outline-none focus-visible:ring-4 focus-visible:ring-ring/25 active:scale-[0.99]"
                {...props}
            >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground [&_svg]:size-5">
                    {icon}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                        {title}
                    </span>
                    {subtitle && (
                        <span className="block truncate text-sm text-muted-foreground">
                            {subtitle}
                        </span>
                    )}
                </span>
                {value && (
                    <span className="shrink-0 text-right tabular-nums">
                        {value}
                    </span>
                )}
            </button>
            {action && <div className="shrink-0 pr-2">{action}</div>}
        </div>
    );
}

/** Small section label above a group of rows, e.g. "Hoy". */
export function ListLabel({ children }: { children: ReactNode }) {
    return (
        <h3 className="px-1 pt-2 text-sm font-semibold text-muted-foreground">
            {children}
        </h3>
    );
}
