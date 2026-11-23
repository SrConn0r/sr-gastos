import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const CURRENCIES = ['COP', 'USD', 'BRL'] as const;

const CURRENCY_LOCALES = { COP: 'es-CO', USD: 'en-US', BRL: 'pt-BR' };

export function formatMoney(
    amount: number | string,
    currency: (typeof CURRENCIES)[number] = 'COP',
): string {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
        style: 'currency',
        currency,
    }).format(Number(amount));
}

export function formatDate(date: string): string {
    // Dates arrive as Y-m-d; parse as local midnight so the day never shifts.
    return new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatMonth(month: string): string {
    return new Date(`${month}-01T00:00:00`).toLocaleDateString('es-CO', {
        month: 'short',
        year: '2-digit',
    });
}
