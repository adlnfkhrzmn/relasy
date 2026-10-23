import { describe, it, expect } from "vitest";
import {
  analyzeCsvImport,
  autoMapCsvColumns,
  cleanImportedPhone,
  detectCsvDelimiter,
  generateCustomerCsvTemplate,
  normalizePhoneForComparison,
  parseCsvRaw,
  serializeCustomersToCsv,
} from "../customer-csv";

describe("Customer CSV Import & Export Utilities", () => {
  it("detects comma and semicolon delimiters accurately", () => {
    expect(detectCsvDelimiter("Nama,Telepon,Email\nBudi,0812,budi@a.id")).toBe(",");
    expect(detectCsvDelimiter("\uFEFFNama;Telepon;Email\r\nBudi;0812;budi@a.id")).toBe(";");
    expect(
      detectCsvDelimiter('"Nama;Lengkap",Telepon,Email\n"Budi; S",0812,budi@a.id')
    ).toBe(",");
  });

  it("parses UTF-8 CSV with BOM, quoted fields, escaped quotes, and multiline notes", () => {
    const raw =
      '\uFEFFNama Lengkap;Nomor Telepon;Email;Perusahaan;Catatan\r\n' +
      '"Andi ""Bintang"" Wijaya";081234567890;andi@wijaya.id;"PT Wijaya, Tbk";"Baris 1\nBaris 2"';

    const parsed = parseCsvRaw(raw);
    expect(parsed.error).toBeUndefined();
    expect(parsed.delimiter).toBe(";");
    expect(parsed.headers).toEqual([
      "Nama Lengkap",
      "Nomor Telepon",
      "Email",
      "Perusahaan",
      "Catatan",
    ]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0][0]).toBe('Andi "Bintang" Wijaya');
    expect(parsed.rows[0][1]).toBe("081234567890");
    expect(parsed.rows[0][3]).toBe("PT Wijaya, Tbk");
    expect(parsed.rows[0][4]).toBe("Baris 1\nBaris 2");
  });

  it("handles empty files, header-only files, and malformed unclosed quotes with Indonesian errors", () => {
    expect(parseCsvRaw("   ").error).toContain("File CSV kosong");
    expect(parseCsvRaw("Nama,Telepon,Email\n").error).toContain(
      "hanya berisi baris judul kolom"
    );
    expect(parseCsvRaw('Nama,Telepon\n"Budi Santoso,0812345').error).toContain(
      "tanda kutip ganda"
    );
  });

  it("preserves leading zeros in phone numbers and normalizes phone numbers for comparison", () => {
    expect(cleanImportedPhone("081234567890")).toBe("081234567890");
    expect(cleanImportedPhone("'081234567890")).toBe("081234567890");
    expect(cleanImportedPhone('="081234567890"')).toBe("081234567890");

    expect(normalizePhoneForComparison("+62 812-3456-7890")).toBe("081234567890");
    expect(normalizePhoneForComparison("6281234567890")).toBe("081234567890");
    expect(normalizePhoneForComparison("081234567890")).toBe("081234567890");
  });

  it("recognizes Indonesian and English column headers and validates rows & duplicates", () => {
    const csv = [
      "Nama Pelanggan,No HP,Alamat Email,Instansi,Sumber,Keterangan",
      "Rina Kartika,081299998888,rina@kartika.id,CV Kartika,Website,Pelanggan baru",
      ",081200001111,tanpanama@test.id,PT Kosong,Iklan,Nama kosong",
      "Dedi Pratama,081277776666,email-tidak-valid,PT Dedi,Rekomendasi,Email salah",
      "Hendra Duplikat,+6281211112222,hendra@baru.id,PT Hendra,Event,Telepon sudah ada di DB",
      "Rina Duplikat File,081299998888,rina2@kartika.id,CV Kartika,Website,Telepon ganda di CSV",
    ].join("\n");

    const parsed = parseCsvRaw(csv);
    const mapping = autoMapCsvColumns(parsed.headers);

    expect(mapping[0]).toBe("name");
    expect(mapping[1]).toBe("phone");
    expect(mapping[2]).toBe("email");
    expect(mapping[3]).toBe("company");
    expect(mapping[4]).toBe("source");
    expect(mapping[5]).toBe("notes");

    const existing = [
      {
        id: "cust_1",
        name: "Hendra Lama",
        phone: "081211112222",
        email: "hendra@lama.id",
      },
    ];

    const analysis = analyzeCsvImport(parsed.rows, mapping, existing);
    expect(analysis.validCount).toBe(1);
    expect(analysis.invalidCount).toBe(2);
    expect(analysis.duplicateCount).toBe(2);

    expect(analysis.rows[0].status).toBe("valid");
    expect(analysis.rows[1].status).toBe("invalid");
    expect(analysis.rows[1].reason).toContain("Nama pelanggan wajib diisi");
    expect(analysis.rows[2].status).toBe("invalid");
    expect(analysis.rows[2].reason).toContain("Format email");
    expect(analysis.rows[3].status).toBe("duplicate");
    expect(analysis.rows[3].matchedCustomerId).toBe("cust_1");
    expect(analysis.rows[4].status).toBe("duplicate");
  });

  it("generates template and serializes customers to CSV preserving leading zeros and special characters", () => {
    const template = generateCustomerCsvTemplate();
    expect(template.startsWith("\uFEFF")).toBe(true);
    expect(template).toContain("Nama Lengkap,Nomor Telepon,Email,Perusahaan,Sumber Pelanggan,Catatan");

    const exported = serializeCustomersToCsv([
      {
        id: "cust_101",
        name: 'PT "Maju, Jaya"',
        phone: "081234567890",
        email: null,
        company: "Maju; Group",
        source: null,
        notes: "Catatan baris 1\nCatatan baris 2",
        created_at: "2026-10-23T00:00:00.000Z",
        archived_at: null,
      },
    ]);

    expect(exported.startsWith("\uFEFF")).toBe(true);
    const reParsed = parseCsvRaw(exported);
    expect(reParsed.error).toBeUndefined();
    expect(reParsed.rows[0][0]).toBe("cust_101");
    expect(reParsed.rows[0][1]).toBe('PT "Maju, Jaya"');
    expect(reParsed.rows[0][2]).toBe("081234567890");
    expect(reParsed.rows[0][3]).toBe("");
    expect(reParsed.rows[0][4]).toBe("Maju; Group");
    expect(reParsed.rows[0][5]).toBe("");
    expect(reParsed.rows[0][6]).toBe("Catatan baris 1\nCatatan baris 2");
    expect(reParsed.rows[0][8]).toBe("Aktif");
  });
});
