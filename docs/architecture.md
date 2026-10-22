# Architecture Principles — Relasy

## Architecture strategy

Inspect the workspace and available runtime before selecting a stack. If no application exists, choose a mainstream, maintainable web stack that Antigravity can test locally and deploy later without unusual infrastructure. Record the exact stack and reasons in `docs/decision-log.md` before significant implementation.

Do not treat a specific framework, hosting provider, or database vendor as a pre-approved decision. Prefer a simple full-stack architecture that supports durable persistence, validation, authorization, and automated tests.

## Required architecture properties

- Clear separation between presentation, domain/business rules, and persistence boundaries.
- Server-side validation for data mutations.
- Consistent error handling and typed data contracts where supported.
- Durable database storage; browser local storage alone is not an adequate production persistence layer for a multi-user hosted CRM.
- Safe database migrations and a documented local setup process.
- Environment variables for secrets and deployment-specific configuration.
- `.env.example` must contain placeholders only and must never contain valid secrets.
- Authorization enforced on the server for every operation involving user-owned records.
- Avoid premature microservices, queues, event buses, or distributed architecture.
- Use a small and deliberate dependency set.

## Repository hygiene

- Keep source code, tests, database schema/migrations, docs, and automation organized and discoverable.
- Include the necessary package scripts for development, type checking, linting, testing, and production build.
- Make local development reproducible with clear setup instructions.
- Keep generated build output and secrets out of version control.
- Do not delete existing work unless clearly obsolete and verified safe to remove.

## Data integrity

- Use stable IDs and timestamps.
- Define deletion/archive behavior for related records.
- Keep ownership checks close to the data access boundary.
- Use transactions for mutations that must update related records atomically.
- Validate dates, currency values, references, and enum/state transitions.
- Avoid cascading destructive deletes unless explicitly justified and protected.

## Observability

Errors should be actionable for developers but should not expose stack traces, secrets, or internal database details to end users. Provide concise development logs and capture relevant test output in the working state. Do not add a third-party monitoring service without an approved need.
