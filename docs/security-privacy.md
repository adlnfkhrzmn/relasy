# Security and Privacy Requirements — Relasy

## Mandatory safeguards

- Never commit credentials, API keys, session secrets, database passwords, or tokens.
- Validate and constrain user input on the server.
- Use parameterized queries or safe ORM patterns.
- Enforce authorization for every read/write on customer, opportunity, activity, and follow-up data.
- If multiple users/accounts exist, test that a user cannot read, modify, export, or delete another account's records by changing an identifier.
- Use secure password/session practices through a well-maintained library or service if authentication is implemented. Never create a custom password storage scheme.
- Protect state-changing routes against applicable web threats, including CSRF where relevant to the selected auth/session model.
- Apply secure cookie flags and appropriate security headers when the stack supports them.
- Avoid logging personal customer data unless needed for debugging, and never log secrets.
- Provide safe error messages to users; keep internal diagnostics on the server.
- Confirm destructive actions and prefer archive/restore for customer records when appropriate.
- Review dependency and framework security warnings. Do not dismiss high-severity findings without a documented justification and mitigation.

## Privacy-by-default

Only collect information needed for CRM tasks. Do not add contact enrichment, tracking pixels, third-party analytics, message scraping, or data sharing without a clear requirement.

## Release checks

Test authorization boundaries, form validation, direct URL access, error responses, secret handling, and destructive actions. Record what was tested and any limitations. Do not claim legal compliance solely because these technical checks passed.
