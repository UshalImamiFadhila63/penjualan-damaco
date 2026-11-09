import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ nama: '', email: '', telepon: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const setField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const result = mode === 'login'
      ? await login({ email: form.email, password: form.password })
      : await register(form);
    setBusy(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    if (mode === 'register' && !localStorage.getItem('token')) {
      toast.success('Akun berhasil dibuat. Silakan masuk.');
      setMode('login');
      return;
    }
    navigate('/akun', { replace: true, state: { showQuoteInfo: location.state?.from === '/akun' } });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand"><span className="brand-mark">D</span> DAMACO</Link>
        <p className="eyebrow">{mode === 'login' ? 'MASUK KE DAMACO' : 'AKUN CUSTOMER'}</p>
        <h1>{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun Anda'}</h1>
        <p className="muted">{mode === 'login' ? 'Masuk untuk membuka workspace atau mengelola akun customer Anda.' : 'Daftar sebagai customer untuk mengelola profil dan keranjang Anda.'}</p>
        <form onSubmit={submit} className="form-stack">
          {mode === 'register' && <>
            <label>Nama lengkap<input required name="nama" value={form.nama} onChange={setField} autoComplete="name" /></label>
            <label>Nomor telepon<input name="telepon" value={form.telepon} onChange={setField} autoComplete="tel" /></label>
          </>}
          <label>Email<input required type="email" name="email" value={form.email} onChange={setField} autoComplete="email" /></label>
          <label>Kata sandi<input required minLength={mode === 'register' ? 8 : 1} type="password" name="password" value={form.password} onChange={setField} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          <button className="button primary full" disabled={busy}>{busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}</button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'}{' '}
          <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </p>
        <Link className="back-link" to="/">← Kembali ke katalog</Link>
      </section>
    </main>
  );
}
