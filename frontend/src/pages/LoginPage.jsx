import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingBag, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email dan password wajib diisi');
      return;
    }
    const result = await login(form);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success('Selamat datang! 🎉');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🛍️</div>
          <div>
            <h1>SistemJual</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Sistem Penjualan Modern
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Masuk ke Akun</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
          Masukkan email dan password untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="admin@penjualan.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 12, top: 34,
                background: 'none', color: 'var(--text-muted)',
                fontSize: 18, padding: 0,
              }}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Memproses...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div style={{
          marginTop: 28, padding: 16, background: 'var(--primary-subtle)',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Demo Login:</strong><br />
          Admin: admin@penjualan.com / password<br />
          Kasir: kasir@penjualan.com / password
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
