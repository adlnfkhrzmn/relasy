# Design Direction — Relasy

## Design objective

Create a modern, indie-feeling CRM that looks intentionally designed and commercially credible. It should feel focused, calm, precise, and approachable—not like a generic admin template, a finance dashboard, or a clone of another CRM.

The product's visual personality should come from strong typographic hierarchy, thoughtful spacing, distinctive but restrained color choices, a coherent component system, real CRM content, and small usability details. Do not rely on gradients, decorative dashboards, or trendy effects to make it look premium.

## Audience and primary job

The primary user is a small-business owner who needs to understand, in a few seconds:
- Which customers need attention?
- Where does each sales opportunity stand?
- What should I follow up on next?

Prioritize clarity, speed, and confidence over visual novelty that makes work harder.

## Visual principles

- Light mode is the initial default.
- Establish one distinctive primary accent and a neutral foundation. Choose and document actual color tokens after inspecting the whole product direction; do not assume a WhatsApp-green color scheme.
- Use no more than two type families unless there is a strong, documented reason.
- Use a compact, legible type scale and deliberate spacing.
- Prefer precise borders and surfaces over stacked shadows.
- Use icons only where they improve recognition. Use one consistent icon family; do not mix emoji and unrelated icon styles.
- Keep corner radii, button heights, input heights, and spacing consistent.
- Use animation only to communicate state or improve orientation. Respect reduced-motion preferences.
- Keep charts and summary cards only when they answer a real user question.
- Build responsive behavior intentionally, not by shrinking a desktop layout.

## Layout direction

The application should use a clear persistent navigation pattern on wider screens and a deliberate compact/mobile navigation on narrow screens. Main workspaces should make common actions visible and keep primary content dominant. Avoid wasting space with oversized headers or hero-like sections inside routine app pages.

The dashboard should prioritize follow-ups and sales work rather than acting as a wall of arbitrary KPI cards. Customer pages should emphasize identity, contact details, latest activity, open opportunities, and the next follow-up. Pipeline views should remain scannable even with longer customer names and small screens.

## Component and state requirements

For each primary page, design and implement:
- Default state.
- Loading state when applicable.
- Empty state with one useful next action.
- Validation and save-error state.
- Success feedback.
- Disabled or permission-denied state when relevant.
- Confirmation for destructive actions.

The user should never have to guess whether a change was saved.

## Anti-slop rules

- No fake charts or invented metrics just to fill space.
- No arbitrary “AI-powered” banners, sparkle icons, fake notifications, unnecessary badges, or decorative status dots.
- No dead controls, placeholder links, or fake functionality.
- No generic hero heading inside every page.
- No repeated cards when a compact list or table is more useful.
- No excessive copy explaining obvious controls.
- No lorem ipsum in the finished product.
- No generated-looking avatars or sample data as a substitute for proper interface design.
- Every decorative element must have an evident purpose; remove it if it does not contribute to comprehension, navigation, or hierarchy.

## Required design artifacts

During the design phase, update this file with concrete decisions for:
- Color tokens and semantic states.
- Typography and type scale.
- Spacing and layout grid.
- Icon approach.
- Buttons, fields, dialogs, tables, list rows, pipeline cards, and task items.
- Navigation behavior at desktop, tablet, and mobile widths.
- Focus, hover, pressed, disabled, loading, and error states.

Capture representative screenshots of the actual running app as it evolves. Do not claim a design is verified based on source code alone.


---

## Concrete Design System Decisions

### 1. Official Relasy Brand Palette & Semantic Token System

Relasy uses a finalized, restrained four-color brand palette paired with subtle supporting UI tokens and semantic status tokens:

#### Official Brand Palette
- **Ink (`#252927`)** — `--color-ink`, `--color-text-primary`
  - Primary headings (`h1`, `h2`, `h3`) and body text.
  - Primary navigation labels and icons.
  - Important form labels, table key values, and high-emphasis interface content.
- **Warm White (`#F7F6F1`)** — `--color-warm-white`, `--color-background`
  - Main application background and large page surfaces.
  - Muted secondary surface containers and table header bands that establish the warm, understated character of the product.
- **Indigo (`#635BCE`)** — `--color-indigo`, `--color-primary` (Hover state: `#524AB8` `--color-indigo-hover`)
  - Primary action buttons (`bg-[#635BCE]` with `#FFFFFF` text).
  - Active navigation indicators (`3px` vertical indicator bar and active icon tint).
  - Selected tabs and interactive controls.
  - Inline links, active sorting indicators, and keyboard `:focus-visible` rings (`2px solid #635BCE`).
- **Soft Indigo (`#E9E8FC`)** — `--color-soft-indigo`, `--color-primary-subtle`
  - Active sidebar navigation pill background (`bg-[#E9E8FC]`).
  - Subtle selected-item and active filter backgrounds.
  - Secondary brand accents, avatar/icon containers, and highlighted controls that complement Indigo without overwhelming the interface.

#### Supporting UI Colors
- **Primary Card Surface (`#FFFFFF`)** — `--color-surface`
  - Cards, tables, sidebar, top bar, modals, and form input backgrounds.
- **Subtle Borders & Separators (`#E5E4DE`)** — `--color-border` (Stronger input/hover border: `#D5D4CD` `--color-border-strong`)
  - Card borders, table dividers, layout hairlines, and form field borders.
- **Secondary Text (`#6F716D`)** — `--color-text-secondary`
  - Supporting descriptions, subtitles, table metadata, and inactive navigation items.
- **Disabled Elements (`#A8AAA4`)** — `--color-disabled`
  - Disabled controls, input placeholders, and low-priority captions.

#### Semantic Status Colors (Strictly for Real Data States)
Semantic status colors are kept visually distinct from the Indigo brand accent and are reserved strictly for real operational states:
- **Success / Completed / Won**: `#047857` (`emerald-700`) text on `#ECFDF5` (`emerald-50`) surface with `#A7F3D0` (`emerald-200`) border.
- **Warning / Due Today**: `#B45309` (`amber-700`) text on `#FFFBEB` (`amber-50`) surface with `#FDE68A` (`amber-200`) border.
- **Danger / Overdue / Destructive**: `#B91C1C` (`red-700`) text on `#FEF2F2` (`red-50`) surface with `#FECACA` (`red-200`) border.

### 2. Interactive State Rules & Accessibility Contrast
- **Primary Buttons**: `bg-[#635BCE]` with `#FFFFFF` text (contrast ratio `5.36:1`, passing WCAG AA), hover `bg-[#524AB8]`, active `bg-[#463FA3]`, focus ring `ring-2 ring-[#635BCE]`.
- **Secondary / Outline Buttons**: `bg-[#FFFFFF]` with `#252927` text (contrast ratio `14.5:1`, passing WCAG AAA) and `border-[#E5E4DE]`, hover `bg-[#F7F6F1]` with `border-[#D5D4CD]`.
- **Active Navigation Items**: `bg-[#E9E8FC]` Soft Indigo pill with `#252927` Ink bold label (contrast ratio `12.4:1`) and `#635BCE` Indigo icon + left indicator bar.
- **Form Controls (`Input`, `Select`, `Textarea`)**: `bg-[#FFFFFF]` surface, `border-[#D5D4CD]` resting border, `#252927` Ink value text, `#A8AAA4` placeholder text, and `focus-visible:ring-2 focus-visible:ring-[#635BCE]` focus indicator.

### 3. Typography & Scale
- **Primary Sans**: System UI / Geist / Inter (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) for all application controls, tables, and metrics.
- **Editorial Accent (Front Showcase Headline Only)**: Instrument Serif / Georgia italic for a single focal phrase in the front showcase hero.
- **Scale**:
  - Page Title (`h1`): `20px–24px` (`font-bold tracking-tight text-[#252927]`)
  - Section Title (`h2`): `16px–18px` (`font-semibold text-[#252927]`)
  - Body / Table Cell: `13px–14px` (`text-[#252927]` primary / `text-[#6F716D]` secondary)
  - Metadata / Label: `12px` (`text-[#6F716D]`)

### 4. Surfaces, Elevation & Motion
- **Borders over Shadows**: Cards and panels use `1px solid #E5E4DE` on `#FFFFFF` surfaces over the `#F7F6F1` Warm White canvas with `rounded-lg` (`8px`) and minimal elevation (`shadow-xs`).
- **Clickable Brand Logo**: When `<RelasyLogo />` is interactive (sidebar toggle or home link), its container remains completely transparent (`bg-transparent hover:bg-transparent active:bg-transparent`) without a surrounding filled button or pill surface, using `focus-visible:ring-2 focus-visible:ring-[#635BCE]` for keyboard focus.
- **Homepage Hero**: Uses `CTASection` (`src/components/ui/hero-dithering-card.tsx`) with lazy-loaded `@paper-design/shaders-react` `Dithering` in official Indigo (`#635BCE`) at subtle opacity (`opacity-20 mix-blend-multiply` in light mode, `opacity-15 mix-blend-screen` in dark mode) and `speed={0}` when `prefers-reduced-motion: reduce` is active.
- **Scrollbars**: Slim `7px` WebKit and `thin` Firefox scrollbars with a transparent track, subtle neutral thumb (`#C8C6BE` in light mode, `#3D433F` in dark mode), and `#635BCE` Indigo thumb on hover.
- **Motion**: Calm, precise `180ms–200ms` cubic-bezier transitions (`[0.22, 1, 0.36, 1]`) for navigation indicators, segmented tabs, and page fades, honoring `prefers-reduced-motion`.
