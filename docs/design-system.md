# Design system

Mobile-first, app-like UI on top of the shadcn/ui primitives already in
`resources/js/components/ui`. Tokens live in `resources/css/app.css`; never
hardcode hex/`neutral-*` colors in pages, use the tokens below.

## Typography

- **Plus Jakarta Sans** 400/500/600/700 (loaded via `bunny()` in `vite.config.ts`).
- Page title: `text-2xl font-bold tracking-tight` (`Heading`).
- Section title: `font-semibold`. Body: `text-sm`/`text-base`.
- Amounts: always `tabular-nums`; hero amounts `text-3xl font-bold`.

## Color

Brand green scale (`brand-50` … `brand-950`, `brand-400` = original `#12D990`)
is available as Tailwind utilities (`bg-brand-100`, `text-brand-700`, …).
Prefer the semantic tokens:

| Token                | Light                              | Dark                    | Use                                   |
| -------------------- | ---------------------------------- | ----------------------- | ------------------------------------- |
| `background`         | mint-tinted off-white + green glow | deep green-black + glow | page                                  |
| `card` / `popover`   | white                              | `oklch(0.2 …)`          | surfaces                              |
| `primary`            | `brand-400`, ink text              | same                    | main CTA, active, checkbox            |
| `foreground` (as bg) | ink                                | near-white              | `ink` button, active bottom-nav item  |
| `muted` / `input`    | soft gray-green                    | dark gray-green         | filled inputs, segmented controls     |
| `accent`             | `brand-100`                        | dark green              | hover, selected menu items, avatar    |
| `success`            | `oklch(0.52 0.12 162)`             | `brand-400`             | income amounts, positive messages     |
| `destructive`        | red                                | red                     | expenses over budget, delete, overdue |
| `chart-1…5`          | green, blue, lime, forest, coral   | brighter variants       | charts (income = 1, expense = 5)      |

## Shape & depth

- `--radius: 1.25rem` → `rounded-sm` 12px, `md` 16px (inputs, menu items),
  `lg` 20px, `xl` 24px (cards, sheets). Buttons, badges, toggles: `rounded-full`.
- Shadow: `shadow-soft` in light; in dark, cards use a 1px border instead.

## Components (restyled shadcn)

- **Button**: pill, `h-11` default (44px touch target), `sm` h-9, `lg` h-13,
  `icon` size-10. Variants: `default` (green), `ink` (dark, like a "Send"
  button), `secondary`, `outline`, `ghost`, `destructive`, `link`.
- **Card**: borderless, `rounded-xl`, `shadow-soft`, `px-5 py-5`.
- **Input / Select**: filled (`bg-input`), no border, `h-11`, focus = card bg +
  soft green ring. 16px text on mobile (avoids iOS zoom).
- **Dialog**: bottom sheet with grab handle on `< sm`, centered modal on `sm+`.
- **ToggleGroup** `variant="outline"`: segmented control (muted track, card thumb).
- **Badge**: pill; `outline` = muted chip.
- **Tooltip**: ink pill.

## Page patterns

- **Lists**: use `ListRow` / `ListLabel` (`components/list-row.tsx`), not
  tables. Tapping a row opens its edit sheet; destructive actions go in the
  sheet via the dialog `footer` prop (`<ConfirmDelete>`). A quick action that
  must stay one tap away (e.g. "Registrar pago") goes in `action`.
- **Hero card**: `rounded-xl bg-primary p-6 text-primary-foreground` for the
  page's key figure (balance, monthly total), with an `ink` CTA inside.
- Group by day with `ListLabel` ("Hoy", "Ayer", date); dates in rows use
  `formatDay` (no year).
- Page container: `mx-auto w-full max-w-3xl` (lists) or `max-w-5xl` (dashboards).

## App shell

- `< md`: sticky translucent top bar (logo + avatar menu) and floating
  bottom nav (`components/bottom-nav.tsx`), active item = ink pill with label.
  Content gets `pb-28` so the nav never covers it. Safe areas via
  `env(safe-area-inset-*)` (`viewport-fit=cover`).
- `md+`: floating collapsible sidebar + breadcrumbs.
- Nav items are defined once in `mainNavItems` (`components/app-sidebar.tsx`).
