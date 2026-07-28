# Design System

<!-- impeccable:design-schema 1 -->

## Direction

Two distinct light themes unified by the same kit structure. Visual world chosen by brief-pinned user direction.

**Sport** — motivational & inspirational: clean white ground, deep amber-gold accent (`#92400e`), championship energy. Barlow Condensed for all display metrics.

**Mind** — calm & relaxing: warm off-white ground (`#f8f6f2`), deep sage green accent (`#3b7a60`), natural grounding. White cards float gently on the warm paper ground.

## Platform

web · mobile-first (player surfaces) · desktop (mentor surfaces)

## Color

Strategy: **Restrained** — bright white / warm-white ground, one strong accent per theme used sparingly.

```
/* Sport theme (default :root) */
--kit-bg:           #ffffff
--kit-surface:      #f7f7f7   /* card panels */
--kit-surface-2:    #eeeeee   /* inputs */
--kit-border:       rgba(0,0,0,0.07)
--kit-border-mid:   rgba(0,0,0,0.12)
--kit-text:         #111827
--kit-text-2:       #6b7280
--kit-text-3:       #9ca3af
--kit-accent:       #92400e   /* deep amber gold — 6.95:1 on white ✓ */
--kit-accent-hover: #7c3409
--kit-accent-light: #b45309
--kit-accent-dim:   rgba(146,64,14,0.10)

/* Mind theme ([data-theme="mind"], .mind-bg) */
--kit-bg:           #f8f6f2   /* warm off-white, like fine paper */
--kit-surface:      #ffffff   /* white cards float on warm ground */
--kit-surface-2:    #f2ede7
--kit-border:       rgba(0,0,0,0.06)
--kit-text:         #1c1c18   /* warm near-black */
--kit-text-2:       #5c6b5e   /* warm muted green-gray */
--kit-text-3:       #a0ada4
--kit-accent:       #3b7a60   /* deep sage green — 4.7:1 on white ✓ */
--kit-accent-hover: #2d6150
--kit-accent-light: #3b7a60
--kit-accent-dim:   rgba(59,122,96,0.10)

/* Shared states */
--kit-success: #16a34a / rgba(22,163,74,0.10)
--kit-warning: #d97706 / rgba(217,119,6,0.10)
--kit-danger:  #dc2626 / rgba(220,38,38,0.10)
```

Theme switching: `[data-theme="mind"]` on the player layout wrapper OR `.mind-bg` on the mentor layout wrapper both trigger the full mind color override via CSS custom property scoping.

## Typography

- **Display / metrics / headings**: Barlow Condensed (600, 700, 800) — `--font-barlow-condensed` → `font-display`
- **Body / labels / UI text**: Barlow (400, 500, 600, 700) — `--font-barlow` → `font-sans`
- No monospace used as decoration.
- Body text: `text-sm` (14px) in cards, `text-xs` for secondary labels.
- Display headings in player pages: `text-3xl font-display font-bold` (h1s), `text-2xl font-display font-bold` (metrics).
- Labels: `text-xs font-bold uppercase tracking-widest` with `--kit-text-2` or accent color.

## Spacing & Layout

- Card border-radius: `1rem` (16px) — `rounded-2xl`
- Content max-width: `max-w-xl` (dashboard) / `max-w-lg` (forms, library)
- Page padding: `px-4 pt-5 pb-24` mobile, `px-8 pt-8 pb-8` desktop
- Card internal padding: `p-5` standard, `p-4` compact
- Section spacing: `space-y-4` standard

## Components

### `.kit-card`
`background: var(--kit-surface); border: 1px solid var(--kit-border); border-radius: 1rem;`
The atomic surface unit. No shadow — depth comes from border, not drop shadow.

### `.btn-primary`
Background: `--kit-accent`. Color: white. Border-radius: `rounded-xl`. Box-shadow: `0 2px 14px var(--kit-accent-dim)`.
Hover: `--kit-accent-hover` + elevated shadow. `disabled:opacity-40`.

### `.btn-secondary`
Background: `--kit-surface-2`. Border: `1px solid --kit-border`. Hover: border strengthens to `--kit-border-focus`.

### `.input`
Background: `--kit-surface-2`. Border: `1px solid --kit-border`. Focus ring: `0 0 0 3px --kit-accent-dim` + border-color: `--kit-accent`.

### Status banners
`.kit-success-banner`, `.kit-warning-banner`, `.kit-error-banner`, `.kit-info-banner` — tinted backgrounds with matching 1px border and semantic color text.

### Player bottom nav
Fixed bottom, 5 items (Acasă / Checkin / Jurnal / Bibliotecă / Profil). Active state: `--kit-accent-light` icon + label, `--kit-accent` 2px glow bar at top edge of nav. Inactive: `--kit-text-3`.

### Checkin items
Full-width rows in a single bordered container (`border: 1px solid var(--kit-border)`). Checked rows: `rgba(34,197,94,0.07)` background. Rows divided by `1px solid var(--kit-border)`. Custom `CheckCircle2` / `Circle` replace native checkboxes (`sr-only`).

### Confidence picker
Three equal-width buttons. Active: color-coded background dim + matching border + matching text. Inactive: `--kit-surface-2` + `--kit-border` + `--kit-text-3`. Symbols: ✓ / — / ✕ in `font-display font-bold`.

### Journal sections
Three cards, each with a 2px colored dot (success / danger / warning) + uppercase color label above the Tiptap editor. Score: row of 6 equal buttons (0–5) in `font-display`; active = `--kit-accent` fill + glow.

### Library cards
Each item: `kit-card` row with lucide icon (colored by file type), name, file type badge, read/unread badge (`Citit` = success / `Nou` = accent-light).

### Metric blocks (dashboard)
Three equal tiles: Streak (shows `Flame` icon + condensed number), Checkin (link), Jurnal (link). Completed tiles: `kit-success-dim` background + `rgba(34,197,94,0.30)` border.

## Prohibited

- Gradient backgrounds or gradient text on any surface.
- `border-left` or `border-right` colored bars wider than 1px on cards or list items.
- Light-mode backgrounds (`#fff`, `#f9fafb`, etc.) — any new component must use kit variables.
- Colored `shadow-*` without offset. Box-shadows that exist must carry offset + blur.
- Emoji as UI icons — use Lucide React icons.

## Dark Mode

`dark` class is set on `<html>` in `app/layout.tsx`. All `dark:` Tailwind variants activate via `@variant dark (&:where(.dark, .dark *))` in `globals.css`. Legacy shared components (mentor/admin) that use `dark:bg-gray-900` etc. activate correctly.

## Responsive

- Mobile (< 768px): bottom nav (5 items), full-width content, `pb-24` clearance.
- Desktop (≥ 768px): left sidebar (14rem), main content offset via `margin-left: 14rem`.
- Player top header: sticky, shows mentor avatar + name (left) + player name (right).
