# Core User Flows — Relasy

## Flow 1: Add a customer

1. User opens Pelanggan.
2. User selects Tambahkan pelanggan.
3. User enters the required name and any optional details.
4. User saves.
5. The app validates the record and persists it.
6. The user sees clear success feedback and can open the new customer's detail view.

Expected handling: missing name, malformed optional contact information where validated, potential duplicate, server/network error, repeated submit, and cancel without accidental data loss.

## Flow 2: Create and advance an opportunity

1. User starts from the customer detail view or Pipeline penjualan.
2. User creates an opportunity and chooses the related customer.
3. User enters a title and optional estimated value/date.
4. User saves; it appears in the correct stage.
5. User moves it to another stage using an accessible, clearly understood interaction.
6. The dashboard and pipeline update from persisted data.

Expected handling: missing title/customer, invalid numeric value, failed update, simultaneous/stale updates if applicable, and confirmation of final outcomes where useful.

## Flow 3: Record customer activity

1. User opens a customer or opportunity.
2. User adds a note or activity type.
3. User saves it.
4. The item appears in the activity history with the correct date/time and author if supported.

Expected handling: empty activity, long note, failed save, and chronological order.

## Flow 4: Schedule and finish follow-up

1. User creates a follow-up from the Follow-up page or a customer detail view.
2. User gives it a title, due date/time, and related customer.
3. It appears in the correct view.
4. User completes, reopens, edits, or reschedules the task.
5. The task leaves or enters the correct status view and related dashboard counts update.

Expected handling: past due dates, timezone consistency, completion timestamp, rescheduling, failed save, and empty lists.

## Flow 5: Find a customer and review context

1. User searches by a supported field.
2. User applies a filter if needed.
3. User opens a result.
4. User sees the latest activity, open opportunities, and next follow-up in context.
5. User returns to the previous list with a predictable navigation experience.

## Flow 6: First use / empty state

A new account with no records must have a useful, non-deceptive first-run state. Show a clear path to add the first customer. Do not show fake metrics, fake conversations, or demo records as if they were real business data.
