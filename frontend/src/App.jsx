import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import PenjualanPage from './pages/PenjualanPage';
import ProdukPage from './pages/ProdukPage';
import MasterDataPage from './pages/MasterDataPage';
import PelangganPage from './pages/PelangganPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="penjualan" element={<PenjualanPage />} />
            <Route path="produk" element={
              <ProtectedRoute roles={['admin', 'gudang', 'kasir']}>
                <ProdukPage />
              </ProtectedRoute>
            } />
            <Route path="kategori" element={
              <ProtectedRoute roles={['admin']}>
                <MasterDataPage />
              </ProtectedRoute>
            } />
            <Route path="supplier" element={
              <ProtectedRoute roles={['admin']}>
                <MasterDataPage />
              </ProtectedRoute>
            } />
            <Route path="pelanggan" element={<PelangganPage />} />
            <Route path="users" element={
              <ProtectedRoute roles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}

export default App;
