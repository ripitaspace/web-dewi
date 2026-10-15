// Isi hanya setelah listing resmi diterbitkan dan extension selesai diuji.
// Biarkan null selama belum tersedia. Masing-masing store diaktifkan sendiri.
export const INVOICE_EXTENSION_STORES: {
  chrome: string | null;
  edge: string | null;
} = {
  chrome: null,
  edge: null,
};
