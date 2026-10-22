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
