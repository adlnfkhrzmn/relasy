# Scope and Boundaries

## Must ship

1. A consistent application shell and navigation.
2. Customer/contact management.
3. Sales opportunities and pipeline stages.
4. Customer/opportunity activity history.
5. Follow-up task management.
6. Dashboard based on real application data.
7. Search, filters, form validation, useful empty/error/loading states.
8. Responsive layout and basic accessibility.
9. Durable persistence, safe access rules, and setup documentation.
10. Automated tests and browser verification for critical flows.
11. Language audit of every user-facing string.

## May ship if it does not distract from core workflows

- Tags and saved filters.
- Import/export of contacts using a safe, validated CSV flow.
- Manual `wa.me` link that opens the user's chosen WhatsApp app/browser, with no synchronization.
- Light/dark theme if it can be completed and tested consistently.

The agent decides whether optional features are worth implementing and must record the reason. Optional features must not delay release-quality core flows.

## Must not ship as part of the initial release

- Direct WhatsApp API or unofficial WhatsApp connections.
- Fake analytics, fake growth figures, or demo records presented as real records.
- Buttons that do nothing or controls that only look interactive.
- An unrequested AI assistant, billing system, or unrelated CRM modules.
- Unnecessary onboarding steps or complicated configuration before the user can add a customer.
