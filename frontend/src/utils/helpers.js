// Format angka ke Rupiah
export const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

// Format tanggal
export const formatTanggal = (tanggal, options = {}) => {
  if (!tanggal) return '-';
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  });
};

// Format tanggal + jam
export const formatTanggalJam = (tanggal) => {
  if (!tanggal) return '-';
  return new Date(tanggal).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Badge status warna
export const getStatusBadge = (status) => {
  const map = {
    selesai: { label: 'Selesai', color: 'success' },
    pending: { label: 'Pending', color: 'warning' },
    batal: { label: 'Batal', color: 'danger' },
  };
  return map[status] || { label: status, color: 'secondary' };
};

// Badge role warna
export const getRoleBadge = (role) => {
  const map = {
    admin: { label: 'Admin', color: 'purple' },
    kasir: { label: 'Kasir', color: 'blue' },
    gudang: { label: 'Gudang', color: 'green' },
  };
  return map[role] || { label: role, color: 'gray' };
};

// Truncate teks
export const truncate = (str, maxLength = 30) => {
  if (!str) return '-';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};
