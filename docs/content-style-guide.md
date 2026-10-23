# UI Content and Indonesian Language Style Guide

## Goal

Every word shown to users must sound like it was written by a thoughtful Indonesian product team. The interface should be clear, concise, current, and natural—not like machine-translated documentation.

## Language rules

1. Use natural, contemporary Indonesian for interface copy.
2. Do not translate English technical terms literally just because a dictionary provides a translation.
3. Preserve an established technical term when Indonesian users and developers commonly use it.
4. Do not mix Indonesian and English randomly within a sentence. Product and technical terms can remain in English when they are the natural choice.
5. Prefer concise labels. Use full sentences for instructions and errors when needed.
6. Keep the tone respectful and direct, not excessively formal, cute, or salesy.
7. Avoid exclamation marks unless a real celebratory moment warrants one.
8. Do not use emoji as UI icons or in routine status messages.
9. Avoid vague AI-generated phrases such as “Unlock your potential”, “Elevate your workflow”, or “Seamlessly manage everything”.
10. Do not invent product capabilities in labels, onboarding, tooltips, or empty states.

## Preferred terminology

Use these terms where relevant and natural:

| Concept | Preferred wording | Avoid |
|---|---|---|
| Cloud server | server cloud / cloud server, depending on context | peladen cloud |
| Dashboard | dashboard | dasbor, unless the user-facing context specifically benefits from it |
| Database | database | pangkalan data, in ordinary product UI |
| Login action | Masuk | log masuk, unless needed for a particular audience |
| Logout action | Keluar | log keluar |
| Search | Cari | Lakukan pencarian terhadap |
| Follow-up | Follow-up | tindak lanjut lanjutan or other awkward doubled wording |
| Sales pipeline | Pipeline penjualan | jalur pipa penjualan |
| Browser | browser | peramban, unless a formal document calls for it |
| Website | website | situs web, unless context/audience calls for it |
| Backup | backup / cadangan, chosen consistently by context | salinan pengaman if it sounds unnatural |
| Save action | Simpan | Lakukan penyimpanan |
| Cancel action | Batal | Batalkan proses ini now, if a simple button is enough |
| Delete action | Hapus | Eliminasi |
| Activity timeline | Riwayat aktivitas | linimasa aktivitas if inconsistent with the rest of the UI |
| Lead/customer prospect | Calon pelanggan | prospek only where the target users understand it |
| Task status | Belum selesai / Selesai | status proses tidak final, unless context requires it |
| Overdue task | Terlambat | Melewati batas waktu, for a short status label |

These are defaults, not a mechanical replacement dictionary. Choose the wording that is most natural in its specific screen.

## Recommended UI wording

- “Tambahkan pelanggan”
- “Cari nama atau nomor telepon”
- “Belum ada pelanggan”
- “Tambahkan pelanggan pertama untuk mulai mengelola relasi.”
- “Perubahan berhasil disimpan.”
- “Data belum berhasil disimpan. Coba lagi.”
- “Tanggal follow-up”
- “Follow-up hari ini”
- “Tandai selesai”
- “Pindahkan ke arsip”
- “Hapus pelanggan?”
- “Tindakan ini tidak bisa dibatalkan.”

Treat these as examples, not mandatory copy if a screen requires a more precise phrase.

## Prohibited writing patterns

- Never use “peladen cloud” or “baris pipa penjualan”.
- Never claim absolute unverified guarantees such as “100% aman dari pemblokiran” or imply automatic WhatsApp synchronization, reading, or background sending.
- Do not include invented statistics, fake testimonials, or exaggerated marketing slogans.
- No word-for-word translation from an English framework or generated source.
- No mixing several synonyms for the same entity across pages.
- No overly formal or bureaucratic phrasing for simple UI actions.
- No inconsistent capitalization, random Title Case, or labels written in all caps without a design reason.
- No buttons labeled “Submit” when “Simpan”, “Buat”, or another specific action is clearer.
- No placeholder copy left in production UI.
- No spelling variants for the same concept (for example, inconsistently switching between “follow up”, “follow-up”, and “tindak lanjut”). Use “follow-up” consistently unless sentence grammar clearly calls for a different form.

## Mandatory copy review

Before closing each phase that changes UI copy:
1. Locate every user-facing string in the changed area.
2. Read the strings in context, not only as isolated keys.
3. Check spelling, clarity, naturalness, tone, consistency, and punctuation.
4. Check empty states, validation, errors, success feedback, confirmation dialogs, toasts, and accessibility labels.
5. Remove duplicate or redundant explanation.
6. Update any string registry or localization files consistently if the app uses them.
7. Record the review in `ops/working-state.md`.
