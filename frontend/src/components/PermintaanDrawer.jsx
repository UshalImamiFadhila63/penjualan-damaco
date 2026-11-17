import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiPlus, FiMinus, FiFileText, FiCheckCircle, FiLock, FiAlertCircle, FiMapPin, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/format';

const PermintaanDrawer = () => {
  const {
    permintaanCart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    clearCart,
    handleCustomerSubmitQuotation,
    customers,
  } = useDamaco();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(user?.perusahaan || '');
  const [contactName, setContactName] = useState(user?.nama || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.telepon || '0812-3456-7890');
  const [notes, setNotes] = useState('');

  // Sync user info into form fields if user is authenticated
  useEffect(() => {
    if (user) {
      if (user.perusahaan) setCompanyName(user.perusahaan);
      if (user.nama) setContactName(user.nama);
      if (user.email) setEmail(user.email);
      if (user.telepon) setPhone(user.telepon);
    }
  }, [user]);

  // Validasi dan ambil alamat lengkap dari profil customer
  const customerAddress = useMemo(() => {
    if (!user) return '';
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const cleanPerusahaan = (user.perusahaan || '').toLowerCase().trim();

    try {
      // 1. Primary address dari daftar alamat pengiriman user (spesifik per-email)
      const userAddrsRaw = localStorage.getItem(`damaco_addresses_user_${cleanEmail}`);
      if (userAddrsRaw) {
        const savedAddresses = JSON.parse(userAddrsRaw);
        if (Array.isArray(savedAddresses) && savedAddresses.length > 0) {
          const primary = savedAddresses.find((a) => a.isPrimary) || savedAddresses[0];
          if (primary?.alamat && typeof primary.alamat === 'string' && primary.alamat.trim().length > 0) {
            return primary.alamat.trim();
          }
        }
      }

      // 2. Fallback ke daftar alamat pengiriman tersimpan umum
      const globalAddrsRaw = localStorage.getItem('damaco_user_addresses_v1');
      if (globalAddrsRaw) {
        const globalAddrs = JSON.parse(globalAddrsRaw);
        if (Array.isArray(globalAddrs) && globalAddrs.length > 0) {
          const primary = globalAddrs.find((a) => a.isPrimary) || globalAddrs[0];
          if (primary?.alamat && typeof primary.alamat === 'string' && primary.alamat.trim().length > 0) {
            return primary.alamat.trim();
          }
        }
      }

      // 3. Alamat di data profil perusahaan akun saat ini
      const savedProfileRaw =
        localStorage.getItem(`damaco_profile_user_${cleanEmail}`) ||
        localStorage.getItem('damaco_user_profile_v1');
      if (savedProfileRaw) {
        const savedProfile = JSON.parse(savedProfileRaw);
        if (savedProfile?.alamat && typeof savedProfile.alamat === 'string' && savedProfile.alamat.trim().length > 0) {
          return savedProfile.alamat.trim();
        }
      }

      // 4. Data customer dari context / database
      const matchedCust = (customers || []).find((c) =>
        (c.email && c.email.toLowerCase().trim() === cleanEmail) ||
        (cleanPerusahaan && c.nama && c.nama.toLowerCase().trim() === cleanPerusahaan)
      );
      if (matchedCust?.alamat && typeof matchedCust.alamat === 'string' && matchedCust.alamat.trim().length > 0) {
        return matchedCust.alamat.trim();
      }

      // 5. Fallback khusus akun demo bawaan
      if (cleanEmail === 'customer@damaco.com' || cleanEmail === 'raka@nusantarageo.co.id') {
        return 'Gedung Cyber 2 Tower Lt. 14, Jl. HR Rasuna Said, Jakarta Selatan';
      }
    } catch (e) {
      console.warn('Gagal membaca alamat profil customer:', e);
    }
    return '';
  }, [user, customers, isCartOpen]);

  const isAddressComplete = Boolean(customerAddress && customerAddress.trim().length > 0);

  if (!isCartOpen) return null;

  const subtotal = permintaanCart.reduce((acc, item) => acc + (item.product.harga * item.qty), 0);
  const ppn11 = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + ppn11;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Silakan masuk atau daftar terlebih dahulu untuk mengirim permintaan penawaran resmi', {
        icon: '🔒',
        duration: 800,
      });
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

    if (!isAddressComplete) {
      toast.error('Mohon lengkapi profil perusahaan dan alamat pengiriman Anda terlebih dahulu sebelum mengajukan permintaan penawaran harga.', {
        icon: '📍',
        duration: 800,
      });
      setIsCartOpen(false);
      navigate('/profil-perusahaan');
      return;
    }

    handleCustomerSubmitQuotation({
      companyName,
      contactName,
      email,
      phone,
      notes,
      alamat: customerAddress,
    });
  };

  return (
    <div className="katalog-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="katalog-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box">
              <FiFileText />
            </div>
            <div>
              <h3 className="drawer-title font-serif">Daftar Permintaan Penawaran</h3>
              <p className="drawer-subtitle">Pilih unit & kirim permintaan penawaran resmi (Quotation B2B)</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={() => setIsCartOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {permintaanCart.length === 0 ? (
            <div className="drawer-empty-state">
              <div className="empty-icon-wrap">📋</div>
              <h4>Belum Ada Produk Dipilih</h4>
              <p>Pilih produk drone atau perlengkapan dari katalog kami untuk meminta penawaran harga resmi.</p>
              <button
                type="button"
                className="btn-katalog-primary"
                style={{ marginTop: 16 }}
                onClick={() => setIsCartOpen(false)}
              >
                Jelajahi Katalog →
              </button>
            </div>
          ) : (
            <>
              {/* Product List */}
              <div className="drawer-items-section">
                <div className="section-head-row">
                  <span className="section-head-title">Unit Terpilih ({permintaanCart.length})</span>
                  <button type="button" className="btn-text-subtle" onClick={clearCart}>
                    Kosongkan
                  </button>
                </div>

                <div className="cart-items-list">
                  {permintaanCart.map(({ product, qty }) => (
                    <div key={product.id} className="cart-item-card">
                      <div className="cart-item-info">
                        <span className="cart-item-brand">{product.brand} • {product.kategori}</span>
                        <h4 className="cart-item-name font-serif">{product.nama}</h4>
                        <span className="cart-item-price">Rp {formatRupiah(product.harga)} / {product.satuan}</span>
                      </div>

                      <div className="cart-item-controls">
                        <div className="qty-stepper">
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => updateCartQty(product.id, qty - 1)}
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="stepper-val">{qty}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => updateCartQty(product.id, qty + 1)}
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <div className="item-subtotal-val">
                          Rp {formatRupiah(Number(product.harga || 0) * qty)}
                        </div>

                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeFromCart(product.id)}
                          title="Hapus produk"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="drawer-calc-box">
                <div className="calc-item-row">
                  <span>Subtotal Produk:</span>
                  <strong>Rp {formatRupiah(subtotal)}</strong>
                </div>
                <div className="calc-item-row">
                  <span>PPN 11% (Termasuk):</span>
                  <span>Rp {formatRupiah(ppn11)}</span>
                </div>
                <div className="calc-item-row grand-total-row">
                  <span>Estimasi Total Penawaran:</span>
                  <strong className="grand-total-val font-serif">
                    Rp {formatRupiah(grandTotal)}
                  </strong>
                </div>
              </div>

              {/* Client Info Form */}
              <form onSubmit={handleSubmit} className="drawer-form-section">
                <h4 className="form-section-title">Data Perusahaan / Pemohon Penawaran</h4>

                <div className="form-field">
                  <label className="field-label">Nama Perusahaan / Instansi *</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Nusantara Geospasial"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-field">
                    <label className="field-label">Nama PIC *</label>
                    <input
                      type="text"
                      required
                      className="field-input"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Contoh: Hendra Wijaya"
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Nomor WhatsApp/HP *</label>
                    <input
                      type="text"
                      required
                      className="field-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0811-2233-4455"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Email Resmi Kantor *</label>
                  <input
                    type="email"
                    required
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hendra@geospasial.co.id"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Catatan Spesifikasi / Kebutuhan Proyek</label>
                  <textarea
                    rows={2}
                    className="field-input textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Butuh surat dukungan distributor dan jadwal demo uji terbang..."
                  />
                </div>

                {!user ? (
                  <div className="drawer-auth-notice-box">
                    <div className="drawer-auth-notice-content">
                      <FiLock className="drawer-lock-icon" size={18} />
                      <div>
                        <strong className="drawer-auth-notice-title">Wajib Masuk / Daftar Akun B2B</strong>
                        <p className="drawer-auth-notice-desc">
                          Untuk mengajukan surat penawaran resmi (Quotation B2B), silakan masuk atau daftarkan profil perusahaan Anda.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-drawer-auth-cta"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/login');
                      }}
                    >
                      Masuk / Daftar Akun B2B →
                    </button>
                  </div>
                ) : !isAddressComplete ? (
                  <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E', fontWeight: 600, fontSize: 13.5 }}>
                      <FiAlertCircle size={18} />
                      <span>Alamat Pengiriman Wajib Dilengkapi</span>
                    </div>
                    <p style={{ color: '#78350F', fontSize: 12.5, margin: '8px 0 12px', lineHeight: 1.5 }}>
                      Sesuai standar operasional pengadaan B2B Damaco, Anda wajib melengkapi profil perusahaan dan alamat pengiriman unit sebelum dapat mengajukan permintaan penawaran resmi.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/profil-perusahaan');
                      }}
                      style={{
                        background: '#D97706',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 14px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      Lengkapi Alamat di Profil Perusahaan →
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiMapPin size={15} color="#286845" />
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Alamat Pengiriman Unit (Tersinkron):
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate('/profil-perusahaan');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#286845',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Ubah di Profil ↗
                        </button>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#14532D', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                        {customerAddress}
                      </p>
                    </div>

                    <div className="guarantee-box">
                      <FiCheckCircle className="guar-icon" />
                      <span>
                        Penawaran resmi bertanda tangan direksi & cap perusahaan akan dikirimkan ke email Anda dalam waktu <strong>1 jam kerja</strong>.
                      </span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className={`btn-submit-permintaan ${!user || !isAddressComplete ? 'require-auth' : ''}`}
                  style={!user || !isAddressComplete ? { opacity: 0.95 } : {}}
                >
                  {!user
                    ? '🔒 Masuk untuk Kirim Permintaan Penawaran'
                    : !isAddressComplete
                    ? '📍 Lengkapi Alamat Sebelum Mengirim Permintaan'
                    : 'Kirim Permintaan Penawaran Resmi →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermintaanDrawer;

