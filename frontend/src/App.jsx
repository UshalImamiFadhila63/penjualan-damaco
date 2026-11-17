import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DamacoProvider } from './context/DamacoContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SemuaPesananPage from './pages/SemuaPesananPage';
import KelolaProdukPage from './pages/KelolaProdukPage';
import KelolaCustomerPage from './pages/KelolaCustomerPage';
import LogAktivitasPage from './pages/LogAktivitasPage';
import KatalogPage from './pages/KatalogPage';
import PesananSayaPage from './pages/PesananSayaPage';
import ProfilPerusahaanPage from './pages/ProfilPerusahaanPage';
import POSPage from './pages/POSPage';
import MasterDataPage from './pages/MasterDataPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <AuthProvider>
      <DamacoProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Public Customer Portal Routes (Default view saat web dibuka) */}
              <Route path="/" element={<KatalogPage />} />
              <Route path="/katalog" element={<KatalogPage />} />
              <Route
                path="/pesanan-saya"
                element={
                  <ProtectedRoute roles={['customer', 'admin']}>
                    <PesananSayaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profil-perusahaan"
                element={
                  <ProtectedRoute roles={['customer', 'admin']}>
                    <ProfilPerusahaanPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/profil" element={<Navigate to="/profil-perusahaan" replace />} />

              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Portal Routes */}
              <Route
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pesanan" element={<SemuaPesananPage />} />
                <Route path="/kelola-produk" element={<KelolaProdukPage />} />
                <Route path="/kelola-customer" element={<KelolaCustomerPage />} />
                <Route path="/log-aktivitas" element={<LogAktivitasPage />} />

                {/* Legacy / Helper Routes */}
                <Route path="/penjualan" element={<SemuaPesananPage />} />
                <Route path="/produk" element={<KelolaProdukPage />} />
                <Route path="/pelanggan" element={<KelolaCustomerPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/kategori" element={<MasterDataPage />} />
                <Route path="/supplier" element={<MasterDataPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>

              {/* Fallback: Redirect unknown to default catalog */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 800, // Tepat 0.8 detik untuk semua pop up notifikasi
            style: {
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EBE7DF',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '13px',
              padding: '10px 14px',
              cursor: 'pointer',
            },
            success: {
              duration: 800,
              iconTheme: { primary: '#286845', secondary: '#fff' },
            },
            error: {
              duration: 800,
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        >
          {(t) => (
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => toast.dismiss(t.id)}
              title="Klik untuk langsung menutup notifikasi"
            >
              <ToastBar toast={t} />
            </div>
          )}
        </Toaster>
      </DamacoProvider>
    </AuthProvider>
  );
}

export default App;
