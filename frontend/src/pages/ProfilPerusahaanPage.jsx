import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiLogOut,
  FiCheck,
  FiSave,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import KatalogHeader from '../components/KatalogHeader';
import PermintaanDrawer from '../components/PermintaanDrawer';
import BandingkanDrawer from '../components/BandingkanDrawer';
import ProductDetailModal from '../components/ProductDetailModal';
import StyleGuideModal from '../components/StyleGuideModal';
import DamacoLogo from '../components/DamacoLogo';
import CustomerFooter from '../components/CustomerFooter';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';
import { damacoService } from '../services';

const INITIAL_PROFILE = {
  nama: 'PT Nusantara Geospasial',
  npwp: '01.234.567.8-012.000',
  alamat: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430',
  pic: 'Raka Pradipta',
  telepon: '0812-3456-7890',
  email: 'raka@nusantarageo.co.id',
  terdaftarSejak: '4 MAR 2026',
};

const INITIAL_ADDRESSES = [
  {
    id: 1,
    label: 'Kantor Pusat',
    isPrimary: true,
    alamat: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430',
    pic: 'Raka Pradipta',
    telepon: '0812-3456-7890',
  },
  {
    id: 2,
    label: 'Gudang Cikarang',
    isPrimary: false,
    alamat: 'Kawasan Jababeka Blok F-12, Cikarang, Bekasi 17530',
    pic: 'Dewi Anggraini',
    telepon: '0813-8800-2211',
  },
];

const ProfilPerusahaanPage = () => {
  const navigate = useNavigate();
  const { setIsStyleGuideOpen, updateCustomerAddress } = useDamaco();
  const { user, logout } = useAuth();

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isDemoCust = userEmail === 'customer@damaco.com' || userEmail === 'raka@nusantarageo.co.id';

  const userProfileKey = useMemo(() => {
    return userEmail ? `damaco_profile_user_${userEmail}` : 'damaco_profile_guest';
  }, [userEmail]);

  const userAddressKey = useMemo(() => {
    return userEmail ? `damaco_addresses_user_${userEmail}` : 'damaco_addresses_guest';
  }, [userEmail]);

  // Load profile from localStorage if exists
  const [profile, setProfile] = useState(() => {
    try {
      const email = (user?.email || '').toLowerCase().trim();
      const pKey = email ? `damaco_profile_user_${email}` : 'damaco_profile_guest';
      const saved = localStorage.getItem(pKey);
      if (saved) return JSON.parse(saved);

      if (email === 'customer@damaco.com' || email === 'raka@nusantarageo.co.id') {
        const legacy = localStorage.getItem('damaco_user_profile_v1');
        return legacy ? JSON.parse(legacy) : INITIAL_PROFILE;
      }

      return {
        nama: user?.perusahaan || '',
        npwp: '01.234.567.8-012.000',
        alamat: '',
        pic: user?.nama || '',
        telepon: user?.telepon || '0812-3456-7890',
        email: user?.email || '',
        terdaftarSejak: new Date()
          .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          .toUpperCase(),
      };
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Sync profile when logged in user changes
  useEffect(() => {
    if (user && user.role === 'customer') {
      try {
        const saved = localStorage.getItem(userProfileKey);
        if (saved) {
          setProfile(JSON.parse(saved));
        } else if (isDemoCust) {
          setProfile(INITIAL_PROFILE);
        } else {
          setProfile((prev) => ({
            ...prev,
            nama: user.perusahaan || prev.nama,
            pic: user.nama || prev.pic,
            email: user.email || prev.email,
            telepon: user.telepon || prev.telepon,
          }));
        }
      } catch {
        // fallback
      }
    }
  }, [user, userProfileKey, isDemoCust]);

  // Load addresses from localStorage if exists - Akun baru selalu KOSONG []
  const [addresses, setAddresses] = useState(() => {
    try {
      const email = (user?.email || '').toLowerCase().trim();
      const aKey = email ? `damaco_addresses_user_${email}` : 'damaco_addresses_guest';
      const saved = localStorage.getItem(aKey);
      if (saved) return JSON.parse(saved);

      if (email === 'customer@damaco.com' || email === 'raka@nusantarageo.co.id') {
        const legacy = localStorage.getItem('damaco_user_addresses_v1');
        return legacy ? JSON.parse(legacy) : INITIAL_ADDRESSES;
      }

      // Setiap akun baru alamat pengirimannya kosong dan harus dibuat dulu
      return [];
    } catch {
      return [];
    }
  });

  // Sync addresses when user account changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userAddressKey);
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else if (isDemoCust) {
        setAddresses(INITIAL_ADDRESSES);
      } else {
        setAddresses([]);
      }
    } catch {
      setAddresses([]);
    }
  }, [userAddressKey, isDemoCust]);

  // Modal Address State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    alamat: '',
    pic: '',
    telepon: '',
    isPrimary: false,
  });

  // Save Company Profile Changes
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(userProfileKey, JSON.stringify(profile));
      localStorage.setItem('damaco_user_profile_v1', JSON.stringify(profile));
      // Sinkronkan ke database penjualan_db
      damacoService.saveProfile({
        email: userEmail,
        nama: profile.pic,
        telepon: profile.telepon,
        namaPerusahaan: profile.nama,
        npwp: profile.npwp,
        alamat: profile.alamat,
        addresses,
      }).catch((err) => console.warn('Sync profile to db warning:', err?.message));

      if (typeof updateCustomerAddress === 'function' && profile.alamat) {
        updateCustomerAddress(userEmail, profile.alamat, profile.nama);
      }

      toast.success('Perubahan data perusahaan berhasil disimpan!', {
        iconTheme: { primary: '#286845', secondary: '#FFFFFF' },
      });
    } catch {
      toast.error('Gagal menyimpan data.');
    }
  };

  // Open Modal Add Address
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: '',
      alamat: '',
      pic: profile.pic || '',
      telepon: profile.telepon || '',
      isPrimary: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  // Open Modal Edit Address
  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      alamat: addr.alamat,
      pic: addr.pic,
      telepon: addr.telepon,
      isPrimary: addr.isPrimary,
    });
    setIsAddressModalOpen(true);
  };

  // Set Address as Primary
  const handleSetPrimary = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isPrimary: a.id === id,
    }));
    setAddresses(updated);
    try {
      localStorage.setItem(userAddressKey, JSON.stringify(updated));
      localStorage.setItem('damaco_user_addresses_v1', JSON.stringify(updated));
    } catch {}
    const target = updated.find(a => a.id === id);
    if (typeof updateCustomerAddress === 'function' && target?.alamat) {
      updateCustomerAddress(userEmail, target.alamat, profile.nama);
    }
    toast.success('Alamat utama berhasil diperbarui!');
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    const target = addresses.find((a) => a.id === id);
    let updated = addresses.filter((a) => a.id !== id);
    if (target?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setAddresses(updated);
    try {
      localStorage.setItem(userAddressKey, JSON.stringify(updated));
      localStorage.setItem('damaco_user_addresses_v1', JSON.stringify(updated));
    } catch {}
    toast.success('Alamat pengiriman berhasil dihapus.');
  };

  // Save Address from Modal
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.label.trim() || !addressForm.alamat.trim()) {
      toast.error('Mohon lengkapi label dan alamat lengkap.');
      return;
    }

    let updated;
    if (editingAddress) {
      // Edit existing
      updated = addresses.map((a) => {
        if (a.id === editingAddress.id) {
          return {
            ...a,
            ...addressForm,
          };
        }
        if (addressForm.isPrimary) {
          return { ...a, isPrimary: false };
        }
        return a;
      });
      toast.success('Alamat berhasil diperbarui!');
    } else {
      // Add new
      const newAddr = {
        id: Date.now(),
        ...addressForm,
      };
      if (addressForm.isPrimary || addresses.length === 0) {
        newAddr.isPrimary = true;
        updated = addresses.map((a) => ({ ...a, isPrimary: false }));
        updated.push(newAddr);
      } else {
        updated = [...addresses, newAddr];
      }
      toast.success('Alamat pengiriman baru berhasil ditambahkan!');
    }

    setAddresses(updated);
    try {
      localStorage.setItem(userAddressKey, JSON.stringify(updated));
      localStorage.setItem('damaco_user_addresses_v1', JSON.stringify(updated));
    } catch {}
    const primaryAddr = updated.find(a => a.isPrimary) || updated[0];
    if (typeof updateCustomerAddress === 'function' && primaryAddr?.alamat) {
      updateCustomerAddress(userEmail, primaryAddr.alamat, profile.nama);
    }
    setIsAddressModalOpen(false);
  };

  // Logout Action
  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    }
    toast('Anda telah keluar dari akun perusahaan.', {
      icon: '👋',
    });
    setTimeout(() => {
      navigate('/login');
    }, 400);
  };

  return (
    <div className="profil-page-viewport">
      {/* Top Navbar */}
      <KatalogHeader />

      {/* Main Container */}
      <main className="profil-main-container">
        {/* Page Header Section */}
        <div className="profil-header-block">
          {/* Dual-tone Dynamic Avatar Badge */}
          <div
            className="profil-avatar-badge"
            title={`${profile.pic || user?.nama || 'Customer'} (${profile.nama || user?.perusahaan || 'Perusahaan'})`}
          >
            <span className="avatar-letter">
              {(profile.pic || user?.nama || 'CP')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>

          <div className="profil-header-text">
            <span className="profil-tagline">AKUN SEJAK {profile.terdaftarSejak}</span>
            <h1 className="profil-main-title font-serif">Profil perusahaan</h1>
          </div>
        </div>

        {/* Two-Column Grid: Left (Data Perusahaan) & Right (Alamat Pengiriman) */}
        <div className="profil-columns-grid">
          {/* ── LEFT COLUMN: Data Perusahaan ───────────────────────────── */}
          <div className="profil-card data-perusahaan-card">
            <div className="profil-card-header">
              <h2 className="card-title font-serif">Data perusahaan</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="profil-form-body">
              {/* Nama Perusahaan */}
              <div className="form-field-group">
                <label className="field-label">Nama perusahaan</label>
                <input
                  type="text"
                  className="field-input"
                  value={profile.nama}
                  onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                  placeholder="Nama resmi PT / CV / Instansi"
                  required
                />
              </div>

              {/* NPWP */}
              <div className="form-field-group">
                <label className="field-label">NPWP</label>
                <input
                  type="text"
                  className="field-input font-mono"
                  value={profile.npwp}
                  onChange={(e) => setProfile({ ...profile, npwp: e.target.value })}
                  placeholder="00.000.000.0-000.000"
                  required
                />
                <span className="field-hint-text">Dipakai untuk faktur pajak</span>
              </div>

              {/* Alamat Perusahaan */}
              <div className="form-field-group">
                <label className="field-label">Alamat perusahaan</label>
                <textarea
                  className="field-textarea"
                  rows={3}
                  value={profile.alamat}
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  placeholder="Alamat kantor resmi sesuai SIUP/NIB"
                  required
                />
              </div>

              {/* Row 2 Columns: PIC & Telepon */}
              <div className="form-fields-row-2">
                <div className="form-field-group">
                  <label className="field-label">PIC</label>
                  <input
                    type="text"
                    className="field-input"
                    value={profile.pic}
                    onChange={(e) => setProfile({ ...profile, pic: e.target.value })}
                    placeholder="Nama PIC pengadaan"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">Telepon</label>
                  <input
                    type="text"
                    className="field-input"
                    value={profile.telepon}
                    onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-field-group">
                <label className="field-label">Email</label>
                <input
                  type="email"
                  className="field-input"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="alamat@perusahaan.co.id"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="profil-form-actions">
                <button type="submit" className="btn-simpan-perubahan">
                  <FiSave size={14} />
                  <span>Simpan perubahan</span>
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT COLUMN: Alamat Pengiriman & Logout ───────────────── */}
          <div className="profil-right-col-stack">
            {/* Alamat Pengiriman Card */}
            <div className="profil-card alamat-pengiriman-card">
              <div className="profil-card-header clean-flex">
                <h2 className="card-title font-serif">Alamat pengiriman</h2>
                <button
                  type="button"
                  className="btn-tambah-alamat"
                  onClick={handleOpenAddAddress}
                  title="Tambah alamat pengiriman baru"
                >
                  <FiPlus size={14} />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="alamat-list-wrap">
                {addresses.length === 0 ? (
                  <div
                    style={{
                      padding: '32px 20px',
                      textAlign: 'center',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1.5px dashed #CBD5E1',
                      margin: '8px 0',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: '#E2E8F0',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      <FiMapPin size={22} />
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                      Belum Ada Alamat Pengiriman
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      Akun baru belum memiliki alamat pengiriman terdaftar. Silakan buat alamat pengiriman utama kantor atau gudang perusahaan Anda terlebih dahulu.
                    </p>
                    <button
                      type="button"
                      className="btn-tambah-alamat"
                      style={{ display: 'inline-flex', margin: '0 auto', padding: '8px 16px', fontSize: 13 }}
                      onClick={handleOpenAddAddress}
                    >
                      <FiPlus size={14} />
                      <span>Buat Alamat Pertama</span>
                    </button>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`alamat-item-card ${addr.isPrimary ? 'primary-active' : ''}`}
                    >
                      {/* Header item: Pin icon + Title + Badge + Actions */}
                      <div className="alamat-item-top">
                        <div className="alamat-title-group">
                          <FiMapPin className="alamat-pin-icon" size={15} />
                          <strong className="alamat-label-text">{addr.label}</strong>
                          {addr.isPrimary && (
                            <span className="badge-alamat-utama">
                              <FiCheck size={11} strokeWidth={3} />
                              <span>Utama</span>
                            </span>
                          )}
                        </div>

                        <div className="alamat-actions-group">
                          <button
                            type="button"
                            className="btn-addr-action"
                            onClick={() => handleOpenEditAddress(addr)}
                            title="Ubah rincian alamat"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-addr-action danger"
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Hapus alamat ini"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Alamat Details */}
                      <p className="alamat-full-text">{addr.alamat}</p>
                      <div className="alamat-contact-line">
                        <span>{addr.pic}</span>
                        <span className="dot-sep">•</span>
                        <span>{addr.telepon}</span>
                      </div>

                      {/* Set Primary Button if not primary */}
                      {!addr.isPrimary && (
                        <div className="alamat-footer-link">
                          <button
                            type="button"
                            className="btn-set-primary-link"
                            onClick={() => handleSetPrimary(addr.id)}
                          >
                            Jadikan alamat utama
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Keluar Dari Akun Button */}
            <button
              type="button"
              className="btn-keluar-akun"
              onClick={handleLogout}
              title="Keluar dari sesi akun portal perusahaan"
            >
              <FiLogOut size={16} />
              <span>Keluar dari akun</span>
            </button>
          </div>
        </div>
      </main>

      {/* ── Customer Unified Footer ───────────────────────────────────────── */}
      <CustomerFooter />

      {/* ── Modal Tambah / Ubah Alamat ───────────────────────────────────── */}
      {isAddressModalOpen && (
        <div className="damaco-modal-backdrop" onClick={() => setIsAddressModalOpen(false)}>
          <div
            className="damaco-modal-container address-editor-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title font-serif">
                {editingAddress ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Pengiriman'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddressModalOpen(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="modal-form-body">
              <div className="form-field-group">
                <label className="field-label">Label Alamat</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Misal: Kantor Pusat, Gudang Cikarang, Workshop"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Alamat Lengkap Pengiriman</label>
                <textarea
                  className="field-textarea"
                  rows={3}
                  placeholder="Nama jalan, gedung, blok, RT/RW, kelurahan, kecamatan, kota & kode pos"
                  value={addressForm.alamat}
                  onChange={(e) => setAddressForm({ ...addressForm, alamat: e.target.value })}
                  required
                />
              </div>

              <div className="form-fields-row-2">
                <div className="form-field-group">
                  <label className="field-label">Nama Penerima (PIC)</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Nama PIC di lokasi"
                    value={addressForm.pic}
                    onChange={(e) => setAddressForm({ ...addressForm, pic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="0812-xxxx-xxxx"
                    value={addressForm.telepon}
                    onChange={(e) => setAddressForm({ ...addressForm, telepon: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.isPrimary}
                    onChange={(e) => setAddressForm({ ...addressForm, isPrimary: e.target.checked })}
                  />
                  <span>Jadikan alamat pengiriman utama</span>
                </label>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingAddress ? 'Simpan Perubahan' : 'Tambah Alamat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <PermintaanDrawer />
      <BandingkanDrawer />
      <ProductDetailModal />
      <StyleGuideModal />
    </div>
  );
};

export default ProfilPerusahaanPage;
