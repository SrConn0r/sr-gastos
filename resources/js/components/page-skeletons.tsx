import { Skeleton } from '@/components/ui/skeleton';

function HeadingSkeleton() {
    return (
        <div className="mb-6 space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
        </div>
    );
}

/** Placeholder shaped like a `ListRow`. */
function RowsSkeleton({ count }: { count: number }) {
    return Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-transparent bg-card p-3 shadow-soft dark:border-border dark:shadow-none"
        >
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-20" />
        </div>
    ));
}

export function DashboardSkeleton() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
            <HeadingSkeleton />
            <Skeleton className="h-44 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="mt-2 h-4 w-36" />
            <RowsSkeleton count={4} />
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 p-4">
            <HeadingSkeleton />
            <Skeleton className="mb-2 h-11 rounded-full" />
            <RowsSkeleton count={7} />
        </div>
    );
}
