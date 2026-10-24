import { getDriver } from "../client";
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

export async function createCustomer(
  workspaceId: string,
  input: CreateCustomerInput
): Promise<CustomerRecord> {
  const db = getDriver();
  const id = `cust_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const name = input.name.trim();
  const phone = input.phone ? input.phone.trim() : null;
  const email = input.email ? input.email.trim().toLowerCase() : null;
  const company = input.company ? input.company.trim() : null;
  const source = input.source ? input.source.trim() : null;
  const notes = input.notes ? input.notes.trim() : null;

  await db.query(
    `INSERT INTO customers (id, workspace_id, name, phone, email, company, source, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, workspaceId, name, phone, email, company, source, notes, now, now]
  );

  return {
    id,
    workspace_id: workspaceId,
    name,
    phone,
    email,
    company,
    source,
    notes,
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
}

export async function getCustomers(
  workspaceId: string,
  options: {
    search?: string;
    filterArchived?: boolean; // false = active only, true = archived only
  } = {}
): Promise<CustomerRecord[]> {
  const db = getDriver();
  const { search, filterArchived = false } = options;

  let query = "SELECT * FROM customers WHERE workspace_id = $1";
  const params: any[] = [workspaceId];

  if (filterArchived) {
    query += " AND archived_at IS NOT NULL";
  } else {
    query += " AND archived_at IS NULL";
  }

  if (search && search.trim()) {
    // ILIKE dipakai supaya pencarian tetap tidak peduli huruf besar-kecil,
    // perilaku yang sebelumnya didapat gratis dari SQLite.
    query +=
      " AND (name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2 OR company ILIKE $2)";
    params.push(`%${search.trim()}%`);
  }

  query += " ORDER BY created_at DESC";

  return db.query<CustomerRecord>(query, params);
}

export async function getAllWorkspaceCustomers(workspaceId: string): Promise<CustomerRecord[]> {
  const db = getDriver();
  return db.query<CustomerRecord>(
    "SELECT * FROM customers WHERE workspace_id = $1 ORDER BY created_at DESC",
    [workspaceId]
  );
}

export async function getCustomerById(
  workspaceId: string,
  customerId: string
): Promise<CustomerRecord | null> {
  const db = getDriver();
  const rows = await db.query<CustomerRecord>(
    "SELECT * FROM customers WHERE id = $1 AND workspace_id = $2",
    [customerId, workspaceId]
  );
  return rows[0] || null;
}

export async function updateCustomer(
  workspaceId: string,
  customerId: string,
  input: UpdateCustomerInput
): Promise<CustomerRecord | null> {
  const db = getDriver();
  const existing = await getCustomerById(workspaceId, customerId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updatedName = input.name !== undefined ? input.name.trim() : existing.name;
  const updatedPhone =
    input.phone !== undefined ? (input.phone ? input.phone.trim() : null) : existing.phone;
  const updatedEmail =
    input.email !== undefined ? (input.email ? input.email.trim().toLowerCase() : null) : existing.email;
  const updatedCompany =
    input.company !== undefined ? (input.company ? input.company.trim() : null) : existing.company;
  const updatedSource =
    input.source !== undefined ? (input.source ? input.source.trim() : null) : existing.source;
  const updatedNotes =
    input.notes !== undefined ? (input.notes ? input.notes.trim() : null) : existing.notes;

  await db.query(
    `UPDATE customers
     SET name = $1, phone = $2, email = $3, company = $4, source = $5, notes = $6, updated_at = $7
     WHERE id = $8 AND workspace_id = $9`,
    [
      updatedName,
      updatedPhone,
      updatedEmail,
      updatedCompany,
      updatedSource,
      updatedNotes,
      now,
      customerId,
      workspaceId,
    ]
  );

  return getCustomerById(workspaceId, customerId);
}

export async function archiveCustomer(workspaceId: string, customerId: string): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();
  const affected = await db.execute(
    "UPDATE customers SET archived_at = $1, updated_at = $2 WHERE id = $3 AND workspace_id = $4",
    [now, now, customerId, workspaceId]
  );
  return affected > 0;
}

export async function restoreCustomer(workspaceId: string, customerId: string): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();
  const affected = await db.execute(
    "UPDATE customers SET archived_at = NULL, updated_at = $1 WHERE id = $2 AND workspace_id = $3",
    [now, customerId, workspaceId]
  );
  return affected > 0;
}

export async function deleteCustomer(workspaceId: string, customerId: string): Promise<boolean> {
  const db = getDriver();
  const affected = await db.execute(
    "DELETE FROM customers WHERE id = $1 AND workspace_id = $2",
    [customerId, workspaceId]
  );
  return affected > 0;
}
