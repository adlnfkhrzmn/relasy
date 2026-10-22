# Information Architecture — Relasy

The exact routing and framework are chosen after workspace inspection. The initial product should expose these primary areas only:

## Primary navigation

1. Ringkasan
2. Pelanggan
3. Pipeline penjualan
4. Follow-up
5. Pengaturan, only when it contains real settings

Avoid creating a navigation item solely to make the application look feature-rich.

## Ringkasan

- Work due today and overdue.
- Open sales opportunities by stage or a compact pipeline summary.
- Recently updated customers/activity.
- Metrics derived from saved data with clearly defined periods.
- Direct links to the records behind summaries.

## Pelanggan

- Customer list with search, useful filters, and a clear create action.
- Customer detail page/panel containing profile, notes, related opportunities, activity history, and upcoming follow-ups.
- Create/edit form.
- Archive and restore behavior where implemented.

## Pipeline penjualan

- Board with consistent stages and opportunity cards.
- Ability to create an opportunity and associate it with a customer.
- Detail/edit view with value if used, stage, notes/activity, and follow-up tasks.
- A list alternative for narrow screens or users who need denser scanning.

## Follow-up

- Views for Hari ini, Mendatang, Terlambat, and Selesai.
- Create/edit task, set due date/time, attach a customer, complete/reopen, and reschedule.
- Each task links back to the relevant customer and opportunity.

## Pengaturan

Only include settings that actually exist, such as profile or preferences. Do not build billing, team permissions, API connections, or integration configuration in the first release without a requirement.

## Navigation and URLs

Use predictable URLs for main pages and important record details when the chosen stack supports routing. Browser back/forward must behave predictably. Deep links to records must not bypass access checks.
