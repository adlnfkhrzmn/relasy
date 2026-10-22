# Product Requirements Document — Relasy

## 1. Product definition

Relasy is a web-based customer relationship management (CRM) application for small businesses. The first release focuses on contact management, sales pipeline tracking, customer activity notes, and follow-up tasks.

## 2. Core requirements

### R1 — Workspace and access
- The implementation must define a safe, maintainable access model appropriate to the selected stack.
- If authentication is included, users must only access records belonging to their own workspace/account.
- Do not pretend a static demo login is production authentication.
- The agent must decide the simplest appropriate initial tenancy model and document the choice. Do not build complex organization roles before needed.

### R2 — Customer management
- Create, view, edit, search, filter, and archive customer/contact records.
- Core fields: full name (required), phone (optional unless justified by a later requirement), email (optional), company/business (optional), source (optional), tags (optional), notes (optional), created date, and last updated date.
- Validate and normalize input without silently changing the user's intent.
- Prevent accidental duplicate creation where practical; warn rather than incorrectly merging records.
- Allow a user to find a customer quickly from the main customer list.

### R3 — Sales opportunities and pipeline
- Create an opportunity associated with a customer.
- Track opportunity title/name, estimated value (optional), stage, owner if supported, expected close date (optional), and last updated date.
- Initial suggested stages: Baru, Dihubungi, Negosiasi, Berhasil, Tidak berhasil. Store stage values consistently and make them easy to maintain.
- Provide a readable pipeline board and a practical list/table view if the architecture can support it without unnecessary complexity.
- Update an opportunity's stage deliberately; support keyboard and accessible alternatives if drag-and-drop is implemented.
- Marking an opportunity as successful or unsuccessful must have an unambiguous outcome and must not fabricate a payment or accounting record.

### R4 — Activity history
- Users can add dated notes or activity entries to a customer and/or opportunity.
- Activity types should remain simple for the first release, for example: Catatan, Telepon, Pertemuan, Pesan manual, Lainnya.
- Timeline entries show what happened and when, in a consistent order.
- The product must not claim to import chat history automatically.

### R5 — Follow-up tasks
- Create a follow-up related to a customer and optionally an opportunity.
- Fields: task title (required), due date/time, status, note (optional), related customer, and completion timestamp where applicable.
- Views: Hari ini, Mendatang, Terlambat, Selesai, with clear empty states.
- Complete, reopen, reschedule, and edit tasks.
- Overdue status must be derived consistently from due time and task status; completed tasks must not appear overdue.
- Use the user's local timezone consistently in the browser and server design.

### R6 — Overview dashboard
- Present a useful summary of records and actions that exist in the database.
- Candidate summaries: open opportunities, opportunities won in a defined period, follow-ups due today, overdue follow-ups, and recently updated customers.
- Every metric must be calculated from real persisted application data, not hard-coded numbers.
- Define time periods and filters clearly. If there is not enough data, show a useful zero/empty state rather than invented growth percentages.
- Provide clear paths from each metric to the relevant records.

### R7 — Search and filtering
- Provide useful search for customers by name and supported contact fields.
- Provide filters that match visible use cases, such as pipeline stage, task status, date range, and tags if tags are included.
- Filters must work together predictably and have a clear way to reset.

### R8 — Reliability and feedback
- All forms show inline validation and clear save/error feedback.
- Loading, empty, success, error, disabled, and destructive-action states must be designed where relevant.
- Destructive actions require safeguards, such as confirmation or archive-first behavior.
- Data-changing controls must persist changes and refresh the relevant views.

### R9 — Responsive and accessible use
- Core CRM tasks must work on desktop, tablet, and mobile-sized screens.
- On narrow screens, data-heavy tables and pipeline boards must reflow or provide a usable alternative rather than clipping the entire page.
- Interactive controls must be keyboard-operable, have visible focus, and use accessible labels.

## 3. Out of scope for initial release

- WhatsApp Business Platform API integration.
- WhatsApp Web automation, unofficial clients/libraries, scraping, or message synchronization.
- Automatic sending or receiving of messages.
- Email marketing, SMS, AI-generated sales advice, AI chatbots, and third-party integration platforms.
- Billing/subscription payments, marketplace, accounting, inventory, invoicing, or full enterprise sales forecasting.
- Complex role-based access and multi-branch organization management unless required to secure the selected architecture.
- Native mobile application.

A simple manual `wa.me` link may be added only if it fits naturally, is safe, and does not delay core CRM workflows. It is not a release requirement and must never be represented as a WhatsApp integration.

## 4. Acceptance criteria

- A user can add a customer, view it, edit it, search for it, and archive it.
- A user can create an opportunity associated with a customer and move it across pipeline stages.
- A user can record activity and see it in the correct customer context.
- A user can create follow-up tasks, see due/overdue tasks, complete them, and reschedule them.
- Dashboard totals match persisted records and documented date rules.
- Reloading the app does not lose saved records.
- Validation and errors are understandable and in natural Indonesian.
- A user cannot access another user's data if authentication/multiple accounts are supported.
- Critical flows pass automated tests and browser tests.
- The production build succeeds without unresolved critical errors.
