# Conceptual Data Model — Relasy

The final schema depends on the chosen stack and tenancy model. Inspect the requirements, choose a normalized practical schema, and document the final fields/migrations before implementing data-heavy features.

## Candidate entities

### User / Account

Represents an authenticated owner or account, if authentication is included. Must have stable identity and secure credential/session handling through an established mechanism.

### Workspace

Optional entity if the chosen architecture needs a workspace separate from a user. Do not add a complex organization hierarchy without a real requirement.

### Customer

Candidate fields: id, owner/workspace reference, name, phone, email, business/company, source, tags, notes, created_at, updated_at, archived_at.

### Opportunity

Candidate fields: id, owner/workspace reference, customer_id, title, stage, estimated_value, currency if values are enabled, expected_close_date, created_at, updated_at, outcome_at.

### Activity

Candidate fields: id, owner/workspace reference, customer_id, optional opportunity_id, type, title or summary, body, happened_at, created_at.

### Follow-up task

Candidate fields: id, owner/workspace reference, customer_id, optional opportunity_id, title, note, due_at, status, completed_at, created_at, updated_at.

## Data rules

- All records have stable unique IDs.
- Related records cannot cross account/workspace boundaries.
- Use foreign keys or equivalent integrity checks.
- Use consistent UTC storage for instants if the selected database supports it; render dates/times in the user's local timezone.
- Define how date-only fields differ from timestamps.
- Use decimal-safe handling for currency rather than floating-point arithmetic where monetary values are stored.
- Avoid storing data not needed for the product.
- Decide whether customers are archived or deleted, then apply a consistent policy to related records.
- Keep sample/seed data clearly separated from real user-created records.
