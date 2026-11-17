import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDamaco } from '../context/DamacoContext';
import {
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiUserCheck,
  FiLock,
  FiMail,
  FiBriefcase,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import DamacoLogo from '../components/DamacoLogo';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, register, loginAsAdmin, loginAsCustomer, loading } = useAuth();
  const { handleRegisterCustomer, clearCart } = useDamaco();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'daftar'
  const [form, setForm] = useState({
    namaPerusahaan: '',
    namaPic: '',
    email: '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Pastikan saat halaman dimuat, form selalu kosong tanpa default / autofill
  useEffect(() => {
    setForm({
      namaPerusahaan: '',
      namaPic: '',
      email: '',
      password: '',
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email dan kata sandi wajib diisi');
      return;
    }

    if (activeTab === 'daftar') {
      if (!form.namaPerusahaan || !form.namaPic) {
        toast.error('Nama Perusahaan dan Nama PIC wajib diisi untuk pendaftaran');
        return;
      }
      if (!form.email || !form.password) {
        toast.error('Email dan kata sandi wajib diisi');
        return;
      }
      
      // 1. Register into Auth system without auto-login (user must log in first)
      register(form, false);

      // 2. Register into Damaco commercial customers database (synced to Admin Kelola Customer)
      handleRegisterCustomer(form);

      // 3. Clear cart for new account
      if (typeof clearCart === 'function') {
        clearCart();
      }

      toast.success(
        `Akun B2B ${form.namaPerusahaan} berhasil didaftarkan! Silakan masukkan email dan kata sandi Anda untuk masuk. 🔐`,
        {
          duration: 800,
          icon: '✅',
        }
      );

      // Switch to login tab dan kosongkan seluruh field
      setActiveTab('login');
      setForm({
        namaPerusahaan: '',
        namaPic: '',
        email: '',
        password: '',
      });
      return;
    }

    const result = await login(form);
    if (!result.success) {
      toast.error(result.message);
    } else {
      const welcomeName = result.user?.nama || result.role || 'User';
      if (result.role === 'customer') {
        toast.success(`Selamat datang, ${welcomeName}! (Customer Portal)`);
        navigate('/katalog', { replace: true });
      } else {
        toast.success(`Selamat datang, ${welcomeName}! (Admin Portal)`);
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const handleUseAdminDemo = () => {
    setForm((prev) => ({
      ...prev,
      email: 'admin@penjualan.com',
      password: 'password',
    }));
    loginAsAdmin();
    toast.success('Masuk sebagai Admin Portal 🚀');
    navigate('/dashboard', { replace: true });
  };

  const handleUseCustomerDemo = () => {
    setForm((prev) => ({
      ...prev,
      email: 'customer@damaco.com',
      password: 'password',
    }));
    loginAsCustomer();
    toast.success('Masuk sebagai Raka Pradipta (PT Nusantara Geospasial) 🏢');
    navigate('/katalog', { replace: true });
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Disalin: ${text}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="damaco-login-container">
      <div className="damaco-login-card">
        {/* Back Link to Catalog */}
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="login-back-katalog-btn"
            onClick={() => navigate('/katalog')}
          >
            ← Kembali ke Katalog
          </button>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <DamacoLogo size="large" />
        </div>

        <h2 className="login-heading font-serif">
          {activeTab === 'login' ? 'Selamat Datang di Damaco' : 'Daftar Akun Perusahaan'}
        </h2>
        <p className="login-subtext">
          {activeTab === 'login'
            ? 'Sistem Operasional Penjualan & Portal Pengadaan B2B'
            : 'Registrasi kemitraan korporat & akses katalog enterprise'}
        </p>

        {/* Tab Switcher: Masuk / Daftar */}
        <div className="login-tab-switcher">
          <button
            type="button"
            className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              // Kosongkan seluruh form saat berpindah ke tab Masuk
              setForm({
                namaPerusahaan: '',
                namaPic: '',
                email: '',
                password: '',
              });
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`login-tab-btn ${activeTab === 'daftar' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('daftar');
              // Kosongkan form pendaftaran — jangan pre-fill dengan data dummy
              setForm({
                namaPerusahaan: '',
                namaPic: '',
                email: '',
                password: '',
              });
            }}
          >
            Daftar Akun Baru
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }} autoComplete="off">
          {/* Hidden inputs to prevent aggressive browser autofill */}
          <input type="text" name="fake_damaco_username" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
          <input type="password" name="fake_damaco_password" style={{ display: 'none' }} tabIndex="-1" autoComplete="new-password" />

          {activeTab === 'daftar' && (
            <>
              <div className="form-section">
                <label className="damaco-label">
                  <FiBriefcase style={{ marginRight: 6 }} /> Nama Perusahaan
                </label>
                <input
                  type="text"
                  name="damaco_company_name"
                  className="damaco-input"
                  placeholder="PT Maju Bersama Teknologi"
                  value={form.namaPerusahaan}
                  onChange={(e) => setForm({ ...form, namaPerusahaan: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-section">
                <label className="damaco-label">
                  <FiUserCheck style={{ marginRight: 6 }} /> Nama PIC Pengadaan
                </label>
                <input
                  type="text"
                  name="damaco_pic_name"
                  className="damaco-input"
                  placeholder="Nama Lengkap Penanggung Jawab"
                  value={form.namaPic}
                  onChange={(e) => setForm({ ...form, namaPic: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>
            </>
          )}

          <div className="form-section">
            <label className="damaco-label">
              <FiMail style={{ marginRight: 6 }} /> Email Kerja
            </label>
            <input
              id="login-email"
              name="damaco_user_email"
              type="email"
              className="damaco-input"
              placeholder="nama@perusahaan.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-section" style={{ position: 'relative' }}>
            <label className="damaco-label">
              <FiLock style={{ marginRight: 6 }} /> Kata Sandi
            </label>
            <input
              id="login-password"
              name="damaco_user_password"
              type={showPass ? 'text' : 'password'}
              className="damaco-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute',
                right: 12,
                top: 32,
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: 16,
                cursor: 'pointer',
              }}
              title={showPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="damaco-action-btn"
            style={{ width: '100%', padding: '13px', justifyContent: 'center', marginTop: 14 }}
            disabled={loading}
          >
            {loading
              ? 'Memproses...'
              : activeTab === 'login'
              ? 'Masuk ke Sistem Damaco →'
              : 'Daftarkan Akun & Lanjut ke Katalog →'}
          </button>
        </form>

        {/* ── Akses Instan Akun Demo ── */}
        <div className="login-demo-section">
          <div className="login-demo-divider">
            <span>atau masuk akun demo pengujian</span>
          </div>

          <div className="login-demo-row">
            {/* Tombol Demo Admin */}
            <button
              type="button"
              className="login-demo-btn admin"
              onClick={handleUseAdminDemo}
            >
              <div className="demo-btn-header">
                <span className="demo-dot admin-dot" />
                <span className="demo-role-name">Admin</span>
              </div>
              <div className="demo-email-text">admin@penjualan.com</div>
              <span className="demo-btn-action">Masuk Admin →</span>
            </button>

            {/* Tombol Demo Customer */}
            <button
              type="button"
              className="login-demo-btn customer"
              onClick={handleUseCustomerDemo}
            >
              <div className="demo-btn-header">
                <span className="demo-dot customer-dot" />
                <span className="demo-role-name">Customer B2B</span>
              </div>
              <div className="demo-email-text">customer@damaco.com</div>
              <span className="demo-btn-action">Masuk Customer →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
