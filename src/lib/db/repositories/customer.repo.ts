import { getDatabase } from "../client";
import crypto from "crypto";

export interface CustomerRecord {
  id: string;
  workspace_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  source?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  source?: string | null;
  notes?: string | null;
}

export function createCustomer(workspaceId: string, input: CreateCustomerInput): CustomerRecord {
  const db = getDatabase();
  const id = `cust_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO customers (id, workspace_id, name, phone, email, company, source, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    workspaceId,
    input.name.trim(),
    input.phone ? input.phone.trim() : null,
    input.email ? input.email.trim().toLowerCase() : null,
    input.company ? input.company.trim() : null,
    input.source ? input.source.trim() : null,
    input.notes ? input.notes.trim() : null,
    now,
    now
  );

  return {
    id,
    workspace_id: workspaceId,
    name: input.name.trim(),
    phone: input.phone ? input.phone.trim() : null,
    email: input.email ? input.email.trim().toLowerCase() : null,
    company: input.company ? input.company.trim() : null,
    source: input.source ? input.source.trim() : null,
    notes: input.notes ? input.notes.trim() : null,
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
}

export function getCustomers(
  workspaceId: string,
  options: {
    search?: string;
    filterArchived?: boolean; // false = active only, true = archived only
  } = {}
): CustomerRecord[] {
  const db = getDatabase();
  const { search, filterArchived = false } = options;

  let query = "SELECT * FROM customers WHERE workspace_id = ?";
  const params: any[] = [workspaceId];

  if (filterArchived) {
    query += " AND archived_at IS NOT NULL";
  } else {
    query += " AND archived_at IS NULL";
  }

  if (search && search.trim()) {
    query += " AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR company LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += " ORDER BY created_at DESC";

  return (db.prepare(query).all(...params) as unknown) as CustomerRecord[];
}

export function getAllWorkspaceCustomers(workspaceId: string): CustomerRecord[] {
  const db = getDatabase();
  return (db
    .prepare("SELECT * FROM customers WHERE workspace_id = ? ORDER BY created_at DESC")
    .all(workspaceId) as unknown) as CustomerRecord[];
}

export function getCustomerById(workspaceId: string, customerId: string): CustomerRecord | null {
  const db = getDatabase();
  const row = (db
    .prepare("SELECT * FROM customers WHERE id = ? AND workspace_id = ?")
    .get(customerId, workspaceId) as unknown) as CustomerRecord | undefined;
  return row || null;
}

export function updateCustomer(
  workspaceId: string,
  customerId: string,
  input: UpdateCustomerInput
): CustomerRecord | null {
  const db = getDatabase();
  const existing = getCustomerById(workspaceId, customerId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updatedName = input.name !== undefined ? input.name.trim() : existing.name;
  const updatedPhone = input.phone !== undefined ? (input.phone ? input.phone.trim() : null) : existing.phone;
  const updatedEmail = input.email !== undefined ? (input.email ? input.email.trim().toLowerCase() : null) : existing.email;
  const updatedCompany = input.company !== undefined ? (input.company ? input.company.trim() : null) : existing.company;
  const updatedSource = input.source !== undefined ? (input.source ? input.source.trim() : null) : existing.source;
  const updatedNotes = input.notes !== undefined ? (input.notes ? input.notes.trim() : null) : existing.notes;

  const stmt = db.prepare(`
    UPDATE customers
    SET name = ?, phone = ?, email = ?, company = ?, source = ?, notes = ?, updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `);

  stmt.run(
    updatedName,
    updatedPhone,
    updatedEmail,
    updatedCompany,
    updatedSource,
    updatedNotes,
    now,
    customerId,
    workspaceId
  );

  return getCustomerById(workspaceId, customerId);
}

export function archiveCustomer(workspaceId: string, customerId: string): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "UPDATE customers SET archived_at = ?, updated_at = ? WHERE id = ? AND workspace_id = ?"
  );
  const res = stmt.run(now, now, customerId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}

export function restoreCustomer(workspaceId: string, customerId: string): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "UPDATE customers SET archived_at = NULL, updated_at = ? WHERE id = ? AND workspace_id = ?"
  );
  const res = stmt.run(now, customerId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}

export function deleteCustomer(workspaceId: string, customerId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM customers WHERE id = ? AND workspace_id = ?");
  const res = stmt.run(customerId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}
