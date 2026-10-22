# Known Risks and Mitigations — Relasy

| Risk | Potential effect | Mitigation / validation | Status |
|---|---|---|---|
| CRM scope expands too early | Delays a usable first release | Strictly adhered to Level 1 scope in `docs/scope.md`; no WhatsApp API, payments, or third-party bloat added. | Resolved |
| Awkward or inconsistent Indonesian UI copy | Product feels machine-translated or untrustworthy | Audited all UI copy against `docs/content-style-guide.md`; zero em dashes, zero "peladen cloud", natural technical loanwords preserved. | Resolved |
| Fake metrics or demo data appear real | Loss of trust | Dashboard derives metrics purely from real-time database queries against persisted SQLite records; zero hardcoded fake metrics. | Resolved |
| Data leaks across accounts | Serious privacy failure | Every database repository function enforces `workspace_id` scoping; verified with comprehensive multi-tenant isolation unit tests (`workspace-isolation.test.ts`). | Resolved |
| Date/time edge cases cause wrong reminders | Users miss follow-ups | ISO 8601 UTC storage with client local date boundary matching (`refDate`); verified in `activity-followup.test.ts` and `followup-activity.spec.ts`. | Resolved |
| Responsive pipeline/table becomes unusable | Core workflow fails on small screens | Built scoped horizontal scroll for Kanban board, responsive table toggles, and tested with Playwright at 393px mobile width with 0 document overflow. | Resolved |
| Tests pass while UI is broken | Defects reach users | 22 comprehensive Playwright E2E browser tests exercising real button clicks, inputs, modals, and route changes on Desktop and Mobile Chrome viewports. | Resolved |
| Optional WhatsApp link is mistaken for integration | Incorrect user expectations | Clean manual `wa.me` external link with clear explanatory badge "WhatsApp manual (tautan eksternal)", strictly no synchronization claimed. | Resolved |
| Selected hosting/database has constraints | Deployment or persistence problems | Built with native Node 24 `node:sqlite` (DatabaseSync with WAL mode); single-file ACID persistence in `./data/relasy.db`; Next.js production build tested and passing. | Resolved |
| Windows PowerShell ExecutionPolicy | Command failure during automated runs | Standardized on `npm.cmd` and `npx.cmd` in all build and test scripts and documented in README.md. | Resolved |
| Port 3000 collision on local environment | Development server startup failure | Relasy explicitly assigned to port 3005 (`http://localhost:3005`) in `package.json`, `playwright.config.ts`, and `.env.example`. | Resolved |

Update this list with newly discovered risks and close items only when evidence supports closure.
