"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { LuxuryNotification } from "@/components/ui/luxury-toast";
import {
  ColumnMappingTarget,
  CUSTOMER_CSV_FIELD_LABELS,
  analyzeCsvImport,
  autoMapCsvColumns,
  generateCustomerCsvTemplate,
  parseCsvRaw,
} from "@/lib/customer-csv";
import {
  MarkContacts,
  MarkSearch,
  MarkPlus,
  MarkPhone,
  MarkMail,
  MarkBuilding,
  MarkArchive,
  MarkRestore,
  MarkChevronRight,
  MarkUpload,
  MarkExport,
  MarkSpreadsheet,
  MarkCheckCircle,
  MarkAlert,
} from "@/components/ui/marks";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
}

interface ImportReportState {
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  rejectedCount: number;
  totalProcessed: number;
  details: {
    rowNumber: number;
    name: string;
    outcome: "imported" | "updated" | "skipped" | "rejected";
    reason?: string;
  }[];
}

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allWorkspaceCustomers, setAllWorkspaceCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"active" | "archived">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Import dialog state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvParseError, setCsvParseError] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRawRows, setCsvRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, ColumnMappingTarget>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update">("skip");
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<ImportReportState | null>(null);

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"filtered" | "all">("filtered");
  const [isExporting, setIsExporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "",
    notes: "",
  });

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrorFeedback("");
    try {
      const isArchived = filterTab === "archived";
      const query = new URLSearchParams({
        archived: isArchived ? "true" : "false",
        ...(searchQuery ? { search: searchQuery } : {}),
      });

      const res = await fetch(`/api/customers?${query.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil data pelanggan");
      }
      const data = await res.json();
      setCustomers(data.data || []);
    } catch {
      setErrorFeedback("Tidak dapat memuat daftar pelanggan dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [filterTab, searchQuery]);

  const fetchAllCustomersForDuplicateCheck = useCallback(async () => {
    try {
      const res = await fetch("/api/customers?scope=all");
      if (res.ok) {
        const data = await res.json();
        setAllWorkspaceCustomers(data.data || []);
      }
    } catch {
      // Fallback to current customers list
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const importAnalysis = useMemo(() => {
    if (csvRawRows.length === 0) return null;
    const referenceList =
      allWorkspaceCustomers.length > 0 ? allWorkspaceCustomers : customers;
    return analyzeCsvImport(csvRawRows, columnMapping, referenceList);
  }, [csvRawRows, columnMapping, allWorkspaceCustomers, customers]);

  const hasNameColumnMapped = useMemo(() => {
    return Object.values(columnMapping).includes("name");
  }, [columnMapping]);

  const handleOpenImportDialog = () => {
    setCsvFileName("");
    setCsvParseError("");
    setCsvHeaders([]);
    setCsvRawRows([]);
    setColumnMapping({});
    setDuplicateStrategy("skip");
    setImportReport(null);
    setIsImportDialogOpen(true);
    fetchAllCustomersForDuplicateCheck();
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateCustomerCsvTemplate();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-impor-pelanggan-relasy.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportReport(null);
    setCsvParseError("");

    if (!file) {
      setCsvFileName("");
      setCsvHeaders([]);
      setCsvRawRows([]);
      setColumnMapping({});
      return;
    }

    setCsvFileName(file.name);

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setCsvParseError("Format file tidak didukung. Pilih file dengan ekstensi .csv.");
      setCsvHeaders([]);
      setCsvRawRows([]);
      return;
    }

    if (file.size === 0) {
      setCsvParseError("File CSV kosong. Pilih file yang memiliki data pelanggan.");
      setCsvHeaders([]);
      setCsvRawRows([]);
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCsvRaw(text);
      if (parsed.error) {
        setCsvParseError(parsed.error);
        setCsvHeaders([]);
        setCsvRawRows([]);
        return;
      }

      setCsvHeaders(parsed.headers);
      setCsvRawRows(parsed.rows);
      setColumnMapping(autoMapCsvColumns(parsed.headers));
    } catch {
      setCsvParseError("Gagal membaca file CSV. Pastikan file menggunakan encoding UTF-8.");
    }
  };

  const handleConfirmImport = async () => {
    if (!importAnalysis) return;
    if (!hasNameColumnMapped) {
      setCsvParseError("Pilih kolom CSV yang dipetakan sebagai 'Nama Lengkap (Wajib)'.");
      return;
    }

    const actionableCount =
      duplicateStrategy === "update"
        ? importAnalysis.validCount + importAnalysis.duplicateCount
        : importAnalysis.validCount;

    if (actionableCount === 0 && importAnalysis.rows.length > 0) {
      // Still allow submitting so the server returns the structured skipped/rejected report
    }

    setIsImporting(true);
    setCsvParseError("");
    try {
      const payloadRows = importAnalysis.rows.map((r) => ({
        rowNumber: r.rowNumber,
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        company: r.company,
        source: r.source,
        notes: r.notes,
      }));

      const res = await fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duplicateStrategy,
          rows: payloadRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengimpor data pelanggan.");
      }

      setImportReport(data.report);
      fetchCustomers();
      fetchAllCustomersForDuplicateCheck();
      setSuccessFeedback(
        `Impor selesai: ${data.report.importedCount} pelanggan ditambahkan${
          data.report.updatedCount > 0 ? `, ${data.report.updatedCount} diperbarui` : ""
        }${data.report.skippedCount > 0 ? `, ${data.report.skippedCount} duplikat dilewati` : ""}.`
      );
      setTimeout(() => setSuccessFeedback(""), 5000);
    } catch (err: any) {
      setCsvParseError(err.message || "Terjadi kesalahan saat mengimpor data pelanggan.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setErrorFeedback("");
    try {
      const params = new URLSearchParams({
        scope: exportScope,
        archived: filterTab === "archived" ? "true" : "false",
        ...(searchQuery ? { search: searchQuery } : {}),
      });

      const res = await fetch(`/api/customers/export?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal mengunduh file ekspor CSV.");
      }

      const csvText = await res.text();
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const dateStamp = new Date().toISOString().split("T")[0];
      const link = document.createElement("a");
      link.href = url;
      link.download = `pelanggan-relasy-${exportScope}-${dateStamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportDialogOpen(false);
      setSuccessFeedback("Data pelanggan berhasil diekspor ke file CSV.");
      setTimeout(() => setSuccessFeedback(""), 4000);
    } catch (err: any) {
      setErrorFeedback(err.message || "Gagal mengekspor data pelanggan.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorFeedback("Nama lengkap wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorFeedback("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan pelanggan");
      }

      setSuccessFeedback(`Pelanggan "${formData.name}" berhasil ditambahkan.`);
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        company: "",
        source: "",
        notes: "",
      });
      fetchCustomers();
      setTimeout(() => setSuccessFeedback(""), 4000);
    } catch (err: any) {
      setErrorFeedback(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (id: string, currentArchived: boolean, name: string) => {
    const action = currentArchived ? "restore" : "archive";
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status arsip.");

      setSuccessFeedback(
        currentArchived
          ? `Pelanggan "${name}" berhasil dipulihkan.`
          : `Pelanggan "${name}" berhasil dipindahkan ke arsip.`
      );
      fetchCustomers();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252927] tracking-tight">
              Daftar Pelanggan
            </h1>
            <p className="text-xs sm:text-sm text-[#6F716D] mt-1">
              Kelola data kontak, informasi bisnis, dan riwayat hubungan pelanggan Anda.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenImportDialog}
              className="gap-1.5"
            >
              <MarkUpload className="w-3.5 h-3.5 text-[#635BCE]" />
              <span>Impor</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExportDialogOpen(true)}
              className="gap-1.5"
            >
              <MarkExport className="w-3.5 h-3.5 text-[#635BCE]" />
              <span>Ekspor</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="gap-1.5"
            >
              <MarkPlus className="w-4 h-4" />
              <span>Tambah pelanggan</span>
            </Button>
          </div>
        </div>

        {/* Feedback Notifications */}
        {successFeedback && (
          <LuxuryNotification
            variant="luxury"
            title="Pembaruan Data Pelanggan"
            message={successFeedback}
            onClose={() => setSuccessFeedback("")}
          />
        )}

        {errorFeedback && (
          <LuxuryNotification
            variant="error"
            title="Perhatian Validasi"
            message={errorFeedback}
            onClose={() => setErrorFeedback("")}
          />
        )}

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <MarkSearch className="w-4 h-4 text-[#6F716D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, nomor telepon, email, perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#FFFFFF] text-[#252927] border border-[#E5E4DE] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent placeholder:text-[#A8AAA4]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-md self-start sm:self-auto border border-[#E5E4DE]">
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                filterTab === "active"
                  ? "text-[#635BCE] font-semibold"
                  : "text-[#6F716D] hover:text-[#252927]"
              }`}
            >
              {filterTab === "active" && (
                <motion.span
                  layoutId="customer-filter-pill"
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 rounded-sm bg-[#E9E8FC] border border-[#D5D3F5]"
                />
              )}
              <span className="relative z-10">Aktif</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("archived")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                filterTab === "archived"
                  ? "text-[#635BCE] font-semibold"
                  : "text-[#6F716D] hover:text-[#252927]"
              }`}
            >
              {filterTab === "archived" && (
                <motion.span
                  layoutId="customer-filter-pill"
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 rounded-sm bg-[#E9E8FC] border border-[#D5D3F5]"
                />
              )}
              <span className="relative z-10">Diarsipkan</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Memuat data pelanggan"
            className="p-6 bg-[#FFFFFF] border border-[#E5E4DE] rounded-lg space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-md bg-[#F7F6F1] animate-pulse"
              />
            ))}
            <p className="text-center text-xs text-[#A8AAA4] pt-1">
              Memuat data pelanggan...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <Card className="overflow-hidden">
            <EmptyState
              icon={MarkContacts}
              title={
                searchQuery
                  ? "Tidak ada pelanggan yang cocok"
                  : filterTab === "active"
                  ? "Belum ada pelanggan aktif"
                  : "Belum ada pelanggan yang diarsipkan"
              }
              description={
                searchQuery
                  ? `Tidak ditemukan pelanggan yang cocok dengan pencarian "${searchQuery}". Coba kata kunci lain.`
                  : filterTab === "active"
                  ? "Tambahkan pelanggan pertama Anda atau impor file CSV untuk mulai mencatat kontak dan jadwal follow-up."
                  : "Pelanggan yang Anda pindahkan ke arsip akan ditampilkan di bagian ini."
              }
              action={
                filterTab === "active" && !searchQuery ? (
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5">
                      <MarkPlus className="w-4 h-4" />
                      <span>Tambah pelanggan pertama</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenImportDialog}
                      className="gap-1.5"
                    >
                      <MarkUpload className="w-4 h-4 text-[#635BCE]" />
                      <span>Impor CSV</span>
                    </Button>
                  </div>
                ) : null
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden divide-y divide-[#E5E4DE]">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#F7F6F1] text-xs font-semibold text-[#6F716D] border-b border-[#E5E4DE]">
              <div className="col-span-4">Nama Pelanggan</div>
              <div className="col-span-3">Kontak</div>
              <div className="col-span-3">Perusahaan & Sumber</div>
              <div className="col-span-2 text-right">Tindakan</div>
            </div>

            {customers.map((cust) => (
              <div
                key={cust.id}
                className="p-4 sm:px-5 sm:py-3.5 hover:bg-[#F7F6F1] transition-colors flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center"
              >
                {/* Name & ID */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E9E8FC] text-[#635BCE] border border-[#D5D3F5] font-bold flex items-center justify-center text-sm shrink-0">
                    {cust.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <Link
                      href={`/pelanggan/${cust.id}`}
                      className="font-semibold text-sm text-[#252927] hover:text-[#635BCE] transition-colors flex items-center gap-1 group truncate"
                    >
                      <span className="truncate">{cust.name}</span>
                      <MarkChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#635BCE] shrink-0" />
                    </Link>
                    <p className="text-[11px] text-[#6F716D]">
                      Terdaftar: {formatDate(cust.created_at)}
                    </p>
                  </div>
                </div>

                {/* Contacts */}
                <div className="col-span-3 space-y-1 text-xs text-[#6F716D]">
                  {cust.phone ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <MarkPhone className="w-3.5 h-3.5 text-[#6F716D] shrink-0" />
                      <span className="truncate">{cust.phone}</span>
                    </div>
                  ) : null}
                  {cust.email ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <MarkMail className="w-3.5 h-3.5 text-[#6F716D] shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  ) : null}
                  {!cust.phone && !cust.email && (
                    <span className="text-[#A8AAA4] italic">Belum ada kontak</span>
                  )}
                </div>

                {/* Company & Source */}
                <div className="col-span-3 space-y-1 text-xs text-[#6F716D]">
                  {cust.company ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <MarkBuilding className="w-3.5 h-3.5 text-[#6F716D] shrink-0" />
                      <span className="font-medium text-[#252927] truncate">{cust.company}</span>
                    </div>
                  ) : null}
                  {cust.source ? (
                    <Badge variant="neutral" size="sm">
                      {cust.source}
                    </Badge>
                  ) : null}
                  {!cust.company && !cust.source && <span className="text-[#A8AAA4]">-</span>}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E4DE]">
                  <Link href={`/pelanggan/${cust.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-[#252927] hover:text-[#635BCE]"
                    >
                      Rincian
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleArchive(cust.id, !!cust.archived_at, cust.name)}
                    className="h-8 px-2 text-xs text-[#6F716D] hover:text-[#252927]"
                    title={cust.archived_at ? "Pulihkan dari arsip" : "Arsipkan pelanggan"}
                  >
                    {cust.archived_at ? (
                      <MarkRestore className="w-3.5 h-3.5" />
                    ) : (
                      <MarkArchive className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Modal Tambah Pelanggan */}
        <Dialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          title="Tambah Pelanggan Baru"
          description="Masukkan informasi kontak pelanggan untuk mulai mengelola relasi."
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nomor Telepon / WhatsApp"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Input
              label="Perusahaan / Usaha (Opsional)"
              placeholder="Contoh: CV Maju Bersama"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Sumber Pelanggan (Opsional)"
              placeholder="Contoh: Rekomendasi, Media Sosial, Website"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            />
            <div className="space-y-1.5">
              <label htmlFor="customer-notes" className="block text-sm font-medium text-[#252927]">
                Catatan Tambahan
              </label>
              <textarea
                id="customer-notes"
                rows={3}
                placeholder="Tuliskan catatan penting tentang preferensi atau kebutuhan pelanggan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-[#E5E4DE] p-2.5 text-sm text-[#252927] bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Simpan pelanggan
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Modal Impor Pelanggan CSV */}
        <Dialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          title="Impor Data Pelanggan (CSV)"
          description="Unggah file CSV, periksa pemetaan kolom dan pratinjau validasi sebelum menyimpan ke database."
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Step 1: File Selection & Template Download */}
            <div className="p-4 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#252927] flex items-center gap-1.5">
                  <MarkSpreadsheet className="w-4 h-4 text-[#635BCE]" />
                  <span>Format CSV yang Didukung</span>
                </p>
                <p className="text-xs text-[#6F716D]">
                  Mendukung file UTF-8 dengan pemisah koma (,) atau titik koma (;). Angka nol di
                  awal nomor telepon tetap terjaga.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-1.5 shrink-0"
              >
                <MarkExport className="w-3.5 h-3.5 text-[#635BCE]" />
                <span>Unduh Template CSV</span>
              </Button>
            </div>

            <div>
              <label
                htmlFor="csv-file-input"
                className="block text-xs sm:text-sm font-medium text-[#252927] mb-1.5"
              >
                Pilih File CSV Pelanggan
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileChange}
                className="block w-full text-xs sm:text-sm text-[#252927] file:mr-3 file:py-2 file:px-3.5 file:rounded-md file:border file:border-[#E5E4DE] file:text-xs file:font-semibold file:bg-[#F7F6F1] file:text-[#252927] hover:file:bg-[#E9E8FC] hover:file:text-[#635BCE] border border-[#E5E4DE] rounded-md p-1.5 bg-[#FFFFFF] cursor-pointer"
              />
              {csvFileName && (
                <p className="text-xs text-[#6F716D] mt-1">
                  File dipilih: <strong className="text-[#252927]">{csvFileName}</strong>
                </p>
              )}
            </div>

            {csvParseError && (
              <div
                role="alert"
                className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
              >
                <MarkAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{csvParseError}</span>
              </div>
            )}

            {/* Step 2: Column Mapping & Validation Preview (Before Commit) */}
            {csvHeaders.length > 0 && importAnalysis && !importReport && (
              <div className="space-y-4">
                {/* Column Mapping */}
                <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#252927]">
                      Pemetaan Kolom CSV
                    </p>
                    {!hasNameColumnMapped && (
                      <span className="text-[11px] font-semibold text-red-700">
                        Wajib memetakan kolom Nama Lengkap
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {csvHeaders.map((header, idx) => (
                      <div
                        key={`${header}-${idx}`}
                        className="p-2 rounded bg-[#FFFFFF] border border-[#E5E4DE] flex flex-col gap-1"
                      >
                        <span
                          className="text-[11px] font-semibold text-[#6F716D] truncate"
                          title={header}
                        >
                          Kolom: {header || `Kolom ${idx + 1}`}
                        </span>
                        <select
                          aria-label={`Pemetaan kolom ${header || idx + 1}`}
                          value={columnMapping[idx] || "ignore"}
                          onChange={(e) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [idx]: e.target.value as ColumnMappingTarget,
                            }))
                          }
                          className="text-xs rounded border border-[#D5D4CD] bg-[#FFFFFF] px-2 py-1 text-[#252927] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#635BCE]"
                        >
                          {(
                            Object.entries(CUSTOMER_CSV_FIELD_LABELS) as [
                              ColumnMappingTarget,
                              string,
                            ][]
                          ).map(([fieldKey, label]) => (
                            <option key={fieldKey} value={fieldKey}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Summary Counts */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-[11px] font-medium text-emerald-800">Baris Valid</p>
                    <p
                      data-testid="import-valid-count"
                      className="text-lg font-bold text-emerald-950"
                    >
                      {importAnalysis.validCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-[11px] font-medium text-amber-800">Potensi Duplikat</p>
                    <p
                      data-testid="import-duplicate-count"
                      className="text-lg font-bold text-amber-950"
                    >
                      {importAnalysis.duplicateCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-[11px] font-medium text-red-800">Baris Tidak Valid</p>
                    <p
                      data-testid="import-invalid-count"
                      className="text-lg font-bold text-red-950"
                    >
                      {importAnalysis.invalidCount}
                    </p>
                  </div>
                </div>

                {/* Duplicate Handling Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#FFFFFF] border border-[#E5E4DE]">
                  <label
                    htmlFor="duplicate-strategy-select"
                    className="text-xs font-semibold text-[#252927]"
                  >
                    Penanganan Data Duplikat:
                  </label>
                  <select
                    id="duplicate-strategy-select"
                    value={duplicateStrategy}
                    onChange={(e) => setDuplicateStrategy(e.target.value as "skip" | "update")}
                    className="text-xs rounded-md border border-[#D5D4CD] bg-[#FFFFFF] px-2.5 py-1.5 text-[#252927] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE]"
                  >
                    <option value="skip">
                      Lewati baris duplikat (Aman, jangan timpa data yang ada)
                    </option>
                    <option value="update">
                      Perbarui pelanggan yang sudah ada jika nomor telepon/email cocok
                    </option>
                  </select>
                </div>

                {/* Preview Table */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#252927]">
                    Pratinjau Data ({importAnalysis.rows.length} baris)
                  </p>
                  <div className="max-h-56 overflow-y-auto border border-[#E5E4DE] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F7F6F1] border-b border-[#E5E4DE] text-[#6F716D] sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Nama</th>
                          <th className="py-2 px-3">Telepon</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E4DE] bg-[#FFFFFF]">
                        {importAnalysis.rows.slice(0, 50).map((row) => (
                          <tr key={row.rowNumber}>
                            <td className="py-2 px-3 text-[#6F716D]">{row.rowNumber}</td>
                            <td className="py-2 px-3 font-medium text-[#252927]">
                              {row.name || <span className="text-red-700 italic">(Kosong)</span>}
                            </td>
                            <td className="py-2 px-3 text-[#6F716D]">{row.phone || "-"}</td>
                            <td className="py-2 px-3 text-[#6F716D]">{row.email || "-"}</td>
                            <td className="py-2 px-3">
                              {row.status === "valid" ? (
                                <Badge variant="success" size="sm">
                                  Siap diimpor
                                </Badge>
                              ) : row.status === "duplicate" ? (
                                <div className="space-y-0.5">
                                  <Badge variant="warning" size="sm">
                                    Duplikat
                                  </Badge>
                                  {row.reason && (
                                    <p className="text-[11px] text-amber-800">{row.reason}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <Badge variant="danger" size="sm">
                                    Tidak valid
                                  </Badge>
                                  {row.reason && (
                                    <p className="text-[11px] text-red-700">{row.reason}</p>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Post-Import Result Report */}
            {importReport && (
              <div
                data-testid="import-result-report"
                className="p-4 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] space-y-3"
              >
                <div className="flex items-center gap-2">
                  <MarkCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="text-sm font-bold text-[#252927]">
                    Laporan Hasil Impor Pelanggan
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E5E4DE]">
                    <span className="text-[#6F716D] block">Berhasil Diimpor</span>
                    <strong className="text-base text-emerald-700">
                      {importReport.importedCount}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E5E4DE]">
                    <span className="text-[#6F716D] block">Diperbarui</span>
                    <strong className="text-base text-[#635BCE]">
                      {importReport.updatedCount}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E5E4DE]">
                    <span className="text-[#6F716D] block">Dilewati (Duplikat)</span>
                    <strong className="text-base text-amber-700">
                      {importReport.skippedCount}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E5E4DE]">
                    <span className="text-[#6F716D] block">Ditolak (Tidak Valid)</span>
                    <strong className="text-base text-red-700">
                      {importReport.rejectedCount}
                    </strong>
                  </div>
                </div>

                {importReport.details.some((d) => d.outcome !== "imported") && (
                  <div className="max-h-40 overflow-y-auto border border-[#E5E4DE] rounded bg-[#FFFFFF] p-2.5 space-y-1 text-xs">
                    {importReport.details
                      .filter((d) => d.outcome !== "imported")
                      .map((item) => (
                        <div
                          key={item.rowNumber}
                          className="flex items-center justify-between gap-2 py-1 border-b last:border-b-0 border-[#E5E4DE]"
                        >
                          <span className="font-medium text-[#252927]">
                            Baris #{item.rowNumber}: {item.name}
                          </span>
                          <span className="text-[#6F716D]">{item.reason}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(false)}
              >
                {importReport ? "Tutup" : "Batal"}
              </Button>
              {!importReport && importAnalysis && (
                <Button
                  type="button"
                  size="sm"
                  isLoading={isImporting}
                  disabled={!hasNameColumnMapped || importAnalysis.rows.length === 0}
                  onClick={handleConfirmImport}
                >
                  Konfirmasi & Impor
                </Button>
              )}
            </div>
          </div>
        </Dialog>

        {/* Modal Ekspor Pelanggan CSV */}
        <Dialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          title="Ekspor Data Pelanggan (CSV)"
          description="Unduh data pelanggan dalam format CSV UTF-8 yang kompatibel dengan spreadsheet."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5E4DE] bg-[#FFFFFF] cursor-pointer hover:bg-[#F7F6F1]">
                <input
                  type="radio"
                  name="export-scope"
                  value="filtered"
                  checked={exportScope === "filtered"}
                  onChange={() => setExportScope("filtered")}
                  className="mt-0.5 accent-[#635BCE]"
                />
                <div className="text-xs">
                  <p className="font-semibold text-[#252927]">
                    Sesuai tampilan & filter saat ini ({customers.length} pelanggan)
                  </p>
                  <p className="text-[#6F716D] mt-0.5">
                    Mengekspor pelanggan pada tab{" "}
                    <strong>{filterTab === "active" ? "Aktif" : "Diarsipkan"}</strong>
                    {searchQuery ? ` dengan kata kunci "${searchQuery}"` : ""}.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5E4DE] bg-[#FFFFFF] cursor-pointer hover:bg-[#F7F6F1]">
                <input
                  type="radio"
                  name="export-scope"
                  value="all"
                  checked={exportScope === "all"}
                  onChange={() => setExportScope("all")}
                  className="mt-0.5 accent-[#635BCE]"
                />
                <div className="text-xs">
                  <p className="font-semibold text-[#252927]">
                    Semua pelanggan di workspace
                  </p>
                  <p className="text-[#6F716D] mt-0.5">
                    Mengekspor seluruh data pelanggan aktif maupun diarsipkan tanpa filter pencarian.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                isLoading={isExporting}
                onClick={handleExecuteExport}
                className="gap-1.5"
              >
                <MarkExport className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}
