import { router } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const THRESHOLD = 72; // damped pull distance (px) that triggers a refresh
const MAX_PULL = 110;
const MIN_SKELETON_MS = 500; // keeps fast reloads from flashing the skeleton

/**
 * Touch pull-to-refresh: dragging down from the top of the page reloads the
 * current Inertia page props and shows `skeleton` while they load.
 */
export function PullToRefresh({
    skeleton,
    children,
}: {
    skeleton: ReactNode;
    children: ReactNode;
}) {
    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const gesture = useRef<{ x: number; y: number; active: boolean } | null>(
        null,
    );
    const pullRef = useRef(0);
    const refreshingRef = useRef(false);

    useEffect(() => {
        const setPullBoth = (value: number) => {
            pullRef.current = value;
            setPull(value);
        };

        const onStart = (event: TouchEvent) => {
            // Only from the very top, and never while a dialog/sheet/menu is
            // open (Radix disables pointer events on the body then).
            const blocked =
                refreshingRef.current ||
                window.scrollY > 0 ||
                document.body.style.pointerEvents === 'none';
            const touch = event.touches[0];
            gesture.current = blocked
                ? null
                : { x: touch.clientX, y: touch.clientY, active: false };
        };

        const onMove = (event: TouchEvent) => {
            const start = gesture.current;

            if (!start) {
                return;
            }

            const touch = event.touches[0];
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;

            // Let horizontal swipes and upward scrolls through untouched.
            if (!start.active && (Math.abs(dx) > Math.abs(dy) || dy <= 0)) {
                gesture.current = null;

                return;
            }

            start.active = true;
            // Stops the browser's own overscroll bounce / pull-to-refresh.
            event.preventDefault();
            setPullBoth(Math.min(Math.max(dy, 0) * 0.5, MAX_PULL));
        };

        const onEnd = () => {
            if (!gesture.current) {
                return;
            }

            gesture.current = null;
            const shouldRefresh = pullRef.current >= THRESHOLD;
            setPullBoth(0);

            if (!shouldRefresh) {
                return;
            }

            refreshingRef.current = true;
            setRefreshing(true);
            const startedAt = Date.now();

            router.reload({
                onFinish: () =>
                    window.setTimeout(
                        () => {
                            refreshingRef.current = false;
                            setRefreshing(false);
                        },
                        Math.max(0, MIN_SKELETON_MS - (Date.now() - startedAt)),
                    ),
            });
        };

        window.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        window.addEventListener('touchcancel', onEnd);

        return () => {
            window.removeEventListener('touchstart', onStart);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
            window.removeEventListener('touchcancel', onEnd);
        };
    }, []);

    const ready = pull >= THRESHOLD;

    return (
        <div className="relative" aria-busy={refreshing}>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
                style={{
                    opacity: Math.min(pull / THRESHOLD, 1),
                    transform: `translateY(${pull - 44}px)`,
                }}
            >
                <span
                    className={cn(
                        'grid size-10 place-items-center rounded-full border bg-card shadow-soft transition-colors',
                        ready &&
                            'border-primary bg-primary text-primary-foreground',
                    )}
                >
                    <RefreshCw
                        className="size-5"
                        style={{ transform: `rotate(${pull * 3}deg)` }}
                    />
                </span>
            </div>
            <span role="status" className="sr-only">
                {refreshing ? 'Actualizando…' : ''}
            </span>
            <div
                className={cn(
                    pull === 0 && 'transition-transform duration-300',
                )}
                style={{
                    transform: pull ? `translateY(${pull}px)` : undefined,
                }}
            >
                {refreshing ? skeleton : children}
            </div>
        </div>
    );
}
