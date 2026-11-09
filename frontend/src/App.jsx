import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import StorefrontPage from './pages/StorefrontPage';
import LoginPage from './pages/LoginPage';
import AdminPages from './pages/AdminPages';
import AccountPage from './pages/AccountPage';
import './index.css';

function homeFor(user) {
  if (!user) return '/';
  return String(user.role).toUpperCase().replaceAll('_', '') === 'SUPERADMIN' ? '/admin' : '/akun';
}

function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="center-state">Memuat akun…</main>;
  if (!user) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  if (String(user.role).toUpperCase().replaceAll('_', '') !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="center-state">Memuat akun…</main>;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/produk/:id" element={<StorefrontPage />} />
      <Route path="/masuk" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/daftar" element={<GuestRoute><LoginPage initialMode="register" /></GuestRoute>} />
      <Route path="/admin/*" element={<RoleRoute role="SUPERADMIN"><AdminPages /></RoleRoute>} />
      <Route path="/akun/*" element={<RoleRoute role="CUSTOMER"><AccountPage /></RoleRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
