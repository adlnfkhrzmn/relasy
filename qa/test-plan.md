# Test Plan — Relasy

## Testing layers

### Unit tests

Cover pure business rules such as:
- Valid pipeline stages and transitions.
- Follow-up due/overdue/completed status calculations.
- Input normalization and validation.
- Date/time and currency helper functions where used.
- Dashboard aggregation logic where it is separated from data access.

### Integration tests

Cover:
- Customer create/read/update/archive with persistence.
- Opportunity creation and stage updates.
- Activity creation and correct associations.
- Follow-up create/update/complete/reopen/reschedule.
- Filtering/search behavior where supported.
- Authorization and ownership boundaries.
- Rejection of invalid or cross-account references.

### Browser tests (Playwright or equivalent)

1. A clean/no-record account sees honest empty states.
2. Create a customer and verify it appears in the list and detail view.
3. Edit/search/filter the customer and verify the rendered result.
4. Create an opportunity for that customer and move it through stages.
5. Add an activity and verify timeline order/context.
6. Create a due-today follow-up, complete it, reopen it, and reschedule it.
7. Verify dashboard summaries update after mutations.
8. Try invalid form submission and verify clear inline errors.
9. Refresh and navigate back/forward to confirm stable data and routing.
10. Exercise narrow/mobile layout for navigation, forms, list/table, pipeline, and dialogs.
11. If authentication exists, attempt direct access to another account's records and confirm denial.
12. Check browser console and failed network requests during critical flows.

## Test data

Use deterministic test fixtures in automated tests. Development demo data must be clearly labelled and must not appear as factual business activity. Do not seed production-like dashboard metrics.

## Test reporting

For each completed phase, record:
- Commands actually executed.
- Pass/fail counts or concise outputs.
- Browser scenarios actually exercised.
- Regressions found and fixed.
- Tests not run and the reason.

The absence of a test failure is not proof of functionality if the relevant flow was never exercised.
