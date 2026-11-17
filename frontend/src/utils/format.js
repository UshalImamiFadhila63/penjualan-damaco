/**
 * Format angka atau string angka ke format Rupiah dengan titik pemisah ribuan (id-ID)
 * Contoh:
 *  144000000 -> "144.000.000"
 *  "144000000.00" -> "144.000.000"
 *  "850000" -> "850.000"
 */
export const formatRupiah = (val) => {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('id-ID');
};

export const formatRupiahFull = (val) => {
  return `Rp ${formatRupiah(val)}`;
};

export default formatRupiah;

