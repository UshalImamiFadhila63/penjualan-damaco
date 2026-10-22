import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Ringkasan aktivitas penjualan hari ini' },
  '/pos': { title: 'Kasir (POS)', subtitle: 'Buat transaksi penjualan baru' },
  '/penjualan': { title: 'Riwayat Penjualan', subtitle: 'Daftar semua transaksi penjualan' },
  '/produk': { title: 'Manajemen Produk', subtitle: 'Kelola data produk dan stok' },
  '/kategori': { title: 'Kategori', subtitle: 'Kelola kategori produk' },
  '/supplier': { title: 'Supplier', subtitle: 'Kelola data supplier' },
  '/pelanggan': { title: 'Pelanggan', subtitle: 'Kelola data pelanggan' },
  '/users': { title: 'Manajemen User', subtitle: 'Kelola akun pengguna sistem' },
};

const AppLayout = () => {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'SistemJual', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{pageInfo.title}</h1>
            {pageInfo.subtitle && <p>{pageInfo.subtitle}</p>}
          </div>
          <div className="topbar-actions">
            <div style={{
              padding: '6px 12px',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
