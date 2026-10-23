export type CustomerCsvField =
  | "id"
  | "name"
  | "phone"
  | "email"
  | "company"
  | "source"
  | "notes";

export type ColumnMappingTarget = CustomerCsvField | "ignore";

export interface ExistingCustomerIdentifier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface ParsedCustomerRow {
  rowNumber: number; // 1-based data row index (excluding header)
  id?: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  status: "valid" | "duplicate" | "invalid";
  reason?: string;
  matchedCustomerId?: string;
}

export interface CsvImportAnalysis {
  rows: ParsedCustomerRow[];
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
}

export interface ExportableCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  created_at?: string;
  archived_at?: string | null;
}

export const CUSTOMER_CSV_FIELD_LABELS: Record<ColumnMappingTarget, string> = {
  name: "Nama Lengkap (Wajib)",
  phone: "Nomor Telepon / WhatsApp",
  email: "Alamat Email",
  company: "Perusahaan / Usaha",
  source: "Sumber Pelanggan",
  notes: "Catatan",
  id: "ID Pelanggan",
  ignore: "Abaikan Kolom",
};

const HEADER_ALIASES: Record<CustomerCsvField, string[]> = {
  id: ["id", "id pelanggan", "customer id", "customer_id", "kode pelanggan"],
  name: [
    "nama",
    "nama lengkap",
    "nama pelanggan",
    "nama klien",
    "name",
    "full name",
    "customer name",
    "kontak",
  ],
  phone: [
    "telepon",
    "nomor telepon",
    "no telepon",
    "no telp",
    "no. telp",
    "no hp",
    "nomor hp",
    "handphone",
    "whatsapp",
    "nomor telepon / whatsapp",
    "wa",
    "phone",
    "phone number",
    "mobile",
  ],
  email: ["email", "alamat email", "e-mail", "email address", "surel"],
  company: [
    "perusahaan",
    "nama perusahaan",
    "usaha",
    "perusahaan / usaha",
    "instansi",
    "organisasi",
    "bisnis",
    "company",
    "organization",
  ],
  source: [
    "sumber",
    "sumber pelanggan",
    "asal",
    "asal pelanggan",
    "channel",
    "source",
    "lead source",
  ],
  notes: ["catatan", "catatan tambahan", "keterangan", "deskripsi", "notes", "note", "memo"],
};

/**
 * Strips UTF-8 BOM if present.
 */
export function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

/**
 * Detects whether a CSV string uses comma (,) or semicolon (;) as its primary delimiter
 * by inspecting the first non-empty line outside quotation marks.
 */
export function detectCsvDelimiter(rawText: string): "," | ";" {
  const cleaned = stripBom(rawText);
  let inQuotes = false;
  let commaCount = 0;
  let semicolonCount = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '"') {
      if (inQuotes && cleaned[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes) {
      if (ch === ",") commaCount++;
      else if (ch === ";") semicolonCount++;
      else if (ch === "\n" || ch === "\r") {
        if (commaCount > 0 || semicolonCount > 0) break;
      }
    }
  }

  return semicolonCount > commaCount ? ";" : ",";
}

/**
 * RFC-4180 compliant CSV parser supporting UTF-8 BOM, comma/semicolon delimiters,
 * quoted values, escaped quotes (""), and multiline fields inside quotes.
 */
export function parseCsvRaw(rawText: string): {
  headers: string[];
  rows: string[][];
  delimiter: "," | ";";
  error?: string;
} {
  const cleaned = stripBom(rawText || "");
  if (!cleaned.trim()) {
    return {
      headers: [],
      rows: [],
      delimiter: ",",
      error: "File CSV kosong. Pilih file yang berisi header kolom dan data pelanggan.",
    };
  }

  const delimiter = detectCsvDelimiter(cleaned);
  const allRows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (ch === "\r" || ch === "\n") {
        if (ch === "\r" && cleaned[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentCell.trim());
        currentCell = "";
        if (currentRow.some((cell) => cell.length > 0)) {
          allRows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentCell += ch;
      }
    }
  }

  if (inQuotes) {
    return {
      headers: [],
      rows: [],
      delimiter,
      error:
        "Format CSV tidak valid: terdapat tanda kutip ganda (\") yang belum ditutup pada salah satu baris.",
    };
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      allRows.push(currentRow);
    }
  }

  if (allRows.length === 0) {
    return {
      headers: [],
      rows: [],
      delimiter,
      error: "File CSV tidak memiliki baris data yang dapat dibaca.",
    };
  }

  const headers = allRows[0].map((h) => h.trim());
  const dataRows = allRows.slice(1);

  if (headers.every((h) => !h)) {
    return {
      headers: [],
      rows: [],
      delimiter,
      error: "Baris pertama (header kolom) pada file CSV kosong.",
    };
  }

  if (dataRows.length === 0) {
    return {
      headers,
      rows: [],
      delimiter,
      error: "File CSV hanya berisi baris judul kolom tanpa baris data pelanggan.",
    };
  }

  return {
    headers,
    rows: dataRows,
    delimiter,
  };
}

/**
 * Automatically recognizes CSV column headers and maps them to CustomerCsvField targets.
 */
export function autoMapCsvColumns(headers: string[]): Record<number, ColumnMappingTarget> {
  const mapping: Record<number, ColumnMappingTarget> = {};
  const usedFields = new Set<CustomerCsvField>();

  headers.forEach((rawHeader, index) => {
    const normalized = rawHeader
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let matchedField: ColumnMappingTarget = "ignore";

    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
      CustomerCsvField,
      string[],
    ][]) {
      if (usedFields.has(field)) continue;
      if (aliases.includes(normalized)) {
        matchedField = field;
        usedFields.add(field);
        break;
      }
    }

    mapping[index] = matchedField;
  });

  return mapping;
}

/**
 * Preserves leading zeros and strips spreadsheet formula wrappers like ="0812..." or '0812...
 */
export function cleanImportedPhone(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  let cleaned = rawPhone.trim();
  // Handle Excel text-forcing prefixes: ="081234" or '081234
  if (cleaned.startsWith('="') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(2, -1).trim();
  } else if (cleaned.startsWith("'")) {
    cleaned = cleaned.slice(1).trim();
  }
  return cleaned || null;
}

/**
 * Normalizes Indonesian phone numbers for duplicate detection (e.g., +62812... -> 0812..., 62812... -> 0812...).
 */
export function normalizePhoneForComparison(phone: string | null | undefined): string {
  const cleaned = cleanImportedPhone(phone);
  if (!cleaned) return "";
  let digits = cleaned.replace(/[^\d+]/g, "");
  if (digits.startsWith("+62")) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("62") && digits.length >= 10) {
    digits = "0" + digits.slice(2);
  }
  return digits.replace(/\D/g, "");
}

const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates mapped CSV rows and checks for duplicates against existing customers and earlier rows in the same CSV.
 */
export function analyzeCsvImport(
  rows: string[][],
  columnMapping: Record<number, ColumnMappingTarget>,
  existingCustomers: ExistingCustomerIdentifier[]
): CsvImportAnalysis {
  const byId = new Map<string, string>();
  const byPhone = new Map<string, string>();
  const byEmail = new Map<string, string>();

  for (const cust of existingCustomers) {
    if (cust.id) byId.set(cust.id.trim().toLowerCase(), cust.id);
    const normPhone = normalizePhoneForComparison(cust.phone);
    if (normPhone && normPhone.length >= 7) {
      byPhone.set(normPhone, cust.id);
    }
    if (cust.email && cust.email.trim()) {
      byEmail.set(cust.email.trim().toLowerCase(), cust.id);
    }
  }

  const seenPhonesInFile = new Set<string>();
  const seenEmailsInFile = new Set<string>();
  const seenIdsInFile = new Set<string>();

  const analyzedRows: ParsedCustomerRow[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  rows.forEach((cells, idx) => {
    const rowNumber = idx + 1;
    const record: Record<CustomerCsvField, string> = {
      id: "",
      name: "",
      phone: "",
      email: "",
      company: "",
      source: "",
      notes: "",
    };

    Object.entries(columnMapping).forEach(([colIdxStr, target]) => {
      if (target === "ignore") return;
      const colIdx = Number(colIdxStr);
      const val = (cells[colIdx] ?? "").trim();
      if (val) {
        record[target] = val;
      }
    });

    const id = record.id ? record.id.trim() : null;
    const name = record.name.trim();
    const phone = cleanImportedPhone(record.phone);
    const email = record.email ? record.email.trim().toLowerCase() : null;
    const company = record.company ? record.company.trim() : null;
    const source = record.source ? record.source.trim() : null;
    const notes = record.notes ? record.notes.trim() : null;

    // 1. Validate required & field constraints
    if (!name) {
      invalidCount++;
      analyzedRows.push({
        rowNumber,
        id,
        name: "",
        phone,
        email,
        company,
        source,
        notes,
        status: "invalid",
        reason: "Nama pelanggan wajib diisi.",
      });
      return;
    }

    if (name.length > 120) {
      invalidCount++;
      analyzedRows.push({
        rowNumber,
        id,
        name,
        phone,
        email,
        company,
        source,
        notes,
        status: "invalid",
        reason: "Nama pelanggan melebihi 120 karakter.",
      });
      return;
    }

    if (email && !SIMPLE_EMAIL_REGEX.test(email)) {
      invalidCount++;
      analyzedRows.push({
        rowNumber,
        id,
        name,
        phone,
        email,
        company,
        source,
        notes,
        status: "invalid",
        reason: `Format email "${email}" tidak valid.`,
      });
      return;
    }

    if (phone && phone.length > 30) {
      invalidCount++;
      analyzedRows.push({
        rowNumber,
        id,
        name,
        phone,
        email,
        company,
        source,
        notes,
        status: "invalid",
        reason: "Nomor telepon melebihi 30 karakter.",
      });
      return;
    }

    // 2. Duplicate check against existing database records or earlier rows in the same CSV
    const normPhone = normalizePhoneForComparison(phone);
    let matchedCustomerId: string | undefined;
    let duplicateReason: string | undefined;

    if (id && byId.has(id.toLowerCase())) {
      matchedCustomerId = byId.get(id.toLowerCase());
      duplicateReason = `ID pelanggan (${id}) sudah terdaftar.`;
    } else if (normPhone && normPhone.length >= 7 && byPhone.has(normPhone)) {
      matchedCustomerId = byPhone.get(normPhone);
      duplicateReason = `Nomor telepon (${phone}) sudah terdaftar.`;
    } else if (email && byEmail.has(email)) {
      matchedCustomerId = byEmail.get(email);
      duplicateReason = `Email (${email}) sudah terdaftar.`;
    } else if (id && seenIdsInFile.has(id.toLowerCase())) {
      duplicateReason = `ID pelanggan (${id}) ganda di dalam file CSV yang sama.`;
    } else if (normPhone && normPhone.length >= 7 && seenPhonesInFile.has(normPhone)) {
      duplicateReason = `Nomor telepon (${phone}) ganda di dalam file CSV yang sama.`;
    } else if (email && seenEmailsInFile.has(email)) {
      duplicateReason = `Email (${email}) ganda di dalam file CSV yang sama.`;
    }

    if (id) seenIdsInFile.add(id.toLowerCase());
    if (normPhone && normPhone.length >= 7) seenPhonesInFile.add(normPhone);
    if (email) seenEmailsInFile.add(email);

    if (duplicateReason) {
      duplicateCount++;
      analyzedRows.push({
        rowNumber,
        id,
        name,
        phone,
        email,
        company,
        source,
        notes,
        status: "duplicate",
        reason: duplicateReason,
        matchedCustomerId,
      });
      return;
    }

    validCount++;
    analyzedRows.push({
      rowNumber,
      id,
      name,
      phone,
      email,
      company,
      source,
      notes,
      status: "valid",
    });
  });

  return {
    rows: analyzedRows,
    validCount,
    duplicateCount,
    invalidCount,
  };
}

/**
 * Escapes a single CSV cell according to RFC-4180.
 */
export function escapeCsvCell(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (
    str.includes(",") ||
    str.includes(";") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a downloadable CSV template with supported customer fields and sample rows.
 */
export function generateCustomerCsvTemplate(): string {
  const headers = [
    "Nama Lengkap",
    "Nomor Telepon",
    "Email",
    "Perusahaan",
    "Sumber Pelanggan",
    "Catatan",
  ];
  const sampleRows = [
    [
      "Budi Santoso",
      "081234567890",
      "budi@majubersama.id",
      "CV Maju Bersama",
      "Rekomendasi",
      "Tertarik paket tahunan untuk 15 cabang",
    ],
    [
      "Siti Rahmawati",
      "081398765432",
      "siti@nusantaraniaga.co.id",
      "PT Nusantara Niaga",
      "Website",
      "Minta jadwal presentasi minggu depan",
    ],
  ];

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...sampleRows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  // Prefix with UTF-8 BOM so Microsoft Excel opens UTF-8 characters properly
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

/**
 * Serializes stored customer records to a UTF-8 CSV string with BOM.
 * Does not invent values for missing fields and preserves leading zeros in phone numbers.
 */
export function serializeCustomersToCsv(customers: ExportableCustomer[]): string {
  const headers = [
    "ID Pelanggan",
    "Nama Lengkap",
    "Nomor Telepon",
    "Email",
    "Perusahaan",
    "Sumber Pelanggan",
    "Catatan",
    "Tanggal Terdaftar",
    "Status",
  ];

  const lines = [headers.map(escapeCsvCell).join(",")];

  for (const cust of customers) {
    const row = [
      cust.id || "",
      cust.name || "",
      cust.phone || "",
      cust.email || "",
      cust.company || "",
      cust.source || "",
      cust.notes || "",
      cust.created_at || "",
      cust.archived_at ? "Diarsipkan" : "Aktif",
    ];
    lines.push(row.map(escapeCsvCell).join(","));
  }

  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}
