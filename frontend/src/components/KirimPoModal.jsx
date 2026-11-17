import React, { useState, useMemo, useEffect } from 'react';
import {
  FiX,
  FiUpload,
  FiCalendar,
  FiFileText,
  FiCheck,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Helper: baca profil customer dari localStorage
const loadCustomerProfile = (email) => {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  try {
    const raw =
      localStorage.getItem(`damaco_profile_user_${cleanEmail}`) ||
      localStorage.getItem('damaco_user_profile_v1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Helper: baca daftar alamat pengiriman customer dari localStorage
const loadCustomerAddresses = (email) => {
  if (!email) return [];
  const cleanEmail = email.toLowerCase().trim();
  try {
    const raw =
      localStorage.getItem(`damaco_addresses_user_${cleanEmail}`) ||
      localStorage.getItem('damaco_user_addresses_v1');
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const KirimPoModal = ({ isOpen, onClose, order, onSubmitPo }) => {
  const { user } = useAuth();

  // Ambil email dari user yang login atau dari order
  const customerEmail = user?.email || order?.email || '';

  // Baca profil & alamat customer (re-compute setiap kali modal dibuka)
  const { initProfile, initAddresses } = useMemo(() => {
    const profile = loadCustomerProfile(customerEmail);
    const addresses = loadCustomerAddresses(customerEmail);
    return { initProfile: profile, initAddresses: addresses };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customerEmail]);

  const primaryAddress = useMemo(
    () => (initAddresses.length ? initAddresses.find((a) => a.isPrimary) || initAddresses[0] : null),
    [initAddresses]
  );

  // Form state — seed awal kosong, di-isi ulang lewat useEffect di bawah
  const [filePo, setFilePo] = useState(null);
  const [nomorPo, setNomorPo] = useState('');
  const [tanggalPo, setTanggalPo] = useState(() => new Date().toISOString().split('T')[0]);
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [npwp, setNpwp] = useState('');
  const [alamatPerusahaan, setAlamatPerusahaan] = useState('');
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [alamatPengiriman, setAlamatPengiriman] = useState('');
  const [picPenerima, setPicPenerima] = useState('');
  const [teleponPic, setTeleponPic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sinkronkan form setiap kali modal dibuka (isOpen berubah jadi true)
  useEffect(() => {
    if (!isOpen) return;
    // Reset file tiap buka
    setFilePo(null);
    setNomorPo('');
    setTanggalPo(new Date().toISOString().split('T')[0]);
    setSelectedAddressIdx(0);

    const profNama = initProfile?.nama || order?.customerNama || '';
    const profNpwp = initProfile?.npwp || order?.npwp || '';
    const profAlamat = initProfile?.alamat || order?.alamat || '';
    setNamaPerusahaan(profNama);
    setNpwp(profNpwp);
    setAlamatPerusahaan(profAlamat);

    if (primaryAddress) {
      // Punya alamat pengiriman tersimpan → pakai alamat itu
      setIsSameAddress(false);
      setAlamatPengiriman(primaryAddress.alamat || profAlamat);
      setPicPenerima(primaryAddress.pic || initProfile?.pic || order?.contact || '');
      setTeleponPic(primaryAddress.telepon || initProfile?.telepon || order?.telepon || '');
    } else {
      // Tidak ada alamat tersimpan → sama dengan alamat perusahaan
      setIsSameAddress(true);
      setAlamatPengiriman(profAlamat);
      setPicPenerima(initProfile?.pic || order?.contact || '');
      setTeleponPic(initProfile?.telepon || order?.telepon || '');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle sama dengan alamat perusahaan toggle
  const handleToggleSameAddress = (e) => {
    const checked = e.target.checked;
    setIsSameAddress(checked);
    if (checked) {
      setAlamatPengiriman(alamatPerusahaan);
    } else if (primaryAddress) {
      setAlamatPengiriman(primaryAddress.alamat || '');
      setPicPenerima(primaryAddress.pic || picPenerima);
      setTeleponPic(primaryAddress.telepon || teleponPic);
    }
  };

  // Handle pilih dari dropdown alamat tersimpan
  const handleChangeAlamatTersimpan = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedAddressIdx(idx);
    const chosen = initAddresses[idx];
    if (chosen) {
      setAlamatPengiriman(chosen.alamat || '');
      setPicPenerima(chosen.pic || picPenerima);
      setTeleponPic(chosen.telepon || teleponPic);
    }
  };

  // File drop / select handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFilePo(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFilePo(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filePo) {
      toast.error('Mohon unggah dokumen PO resmi (PDF atau foto gambar) terlebih dahulu.');
      return;
    }
    if (!nomorPo.trim()) {
      toast.error('Mohon isi Nomor PO resmi perusahaan Anda.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitPo({
        orderId: order.id,
        orderNomor: order.nomor,
        nomorPo: nomorPo.trim(),
        tanggalPo,
        fileName: filePo ? filePo.name : 'PO_Resmi_NusantaraGeo.pdf',
        namaPerusahaan,
        npwp,
        alamatPerusahaan,
        alamatPengiriman,
        picPenerima,
        teleponPic,
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  // Guard: jangan render modal jika tidak terbuka atau order tidak ada
  if (!isOpen || !order) return null;

  return (
    <div className="kirim-po-modal-backdrop" onClick={onClose}>
      <div className="kirim-po-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="kirim-po-header">
          <div className="kirim-po-header-titles">
            <h2 className="kirim-po-title font-serif">Kirim PO</h2>
            <p className="kirim-po-subtitle">
              Untuk penawaran <strong>{order?.nomor || '-'}</strong> • Rp {(order?.total || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <button
            type="button"
            className="kirim-po-close-btn"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="kirim-po-form-body">
          {/* 1. File PO Upload Area */}
          <div className="kirim-po-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="kirim-po-label" style={{ margin: 0 }}>
                File PO <span style={{ color: '#E53935' }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: filePo ? '#22C55E' : '#94A3B8' }}>
                {filePo ? '✓ Dokumen terpilih' : 'Wajib diunggah'}
              </span>
            </div>
            <div
              className={`kirim-po-dropzone ${filePo ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('po-file-input').click()}
            >
              <input
                id="po-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="dropzone-icon-circle">
                <FiUpload size={20} />
              </div>

              {filePo ? (
                <div className="dropzone-file-info">
                  <div className="dropzone-file-name">
                    <FiFileText size={15} />
                    <span>{filePo.name}</span>
                  </div>
                  <span className="dropzone-file-size">
                    {(filePo.size / 1024 / 1024).toFixed(2)} MB • Siap diunggah
                  </span>
                  <span className="dropzone-change-text">Klik untuk mengganti berkas</span>
                </div>
              ) : (
                <div className="dropzone-prompt">
                  <span className="dropzone-main-text">
                    Tarik file ke sini atau <u className="dropzone-underline">pilih file</u>
                  </span>
                  <span className="dropzone-sub-text">PDF atau gambar, maks 10 MB</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Nomor PO & Tanggal PO (2 Kolom) */}
          <div className="kirim-po-grid-2">
            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Nomor PO</label>
              <input
                type="text"
                className="kirim-po-input"
                placeholder="PO-NG/0912/2026"
                value={nomorPo}
                onChange={(e) => setNomorPo(e.target.value)}
                required
              />
            </div>

            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Tanggal PO</label>
              <div className="kirim-po-input-with-icon">
                <input
                  type="date"
                  className="kirim-po-input"
                  value={tanggalPo}
                  onChange={(e) => setTanggalPo(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Section: DATA PERUSAHAAN */}
          <div className="kirim-po-section-block">
            <span className="kirim-po-section-heading">DATA PERUSAHAAN</span>

            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Nama perusahaan</label>
              <input
                type="text"
                className="kirim-po-input"
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                required
              />
            </div>

            <div className="kirim-po-field-group">
              <label className="kirim-po-label">NPWP</label>
              <input
                type="text"
                className="kirim-po-input"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
              />
            </div>

            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Alamat perusahaan</label>
              <textarea
                className="kirim-po-textarea"
                rows={2}
                value={alamatPerusahaan}
                onChange={(e) => {
                  setAlamatPerusahaan(e.target.value);
                  if (isSameAddress) setAlamatPengiriman(e.target.value);
                }}
                required
              />
            </div>
          </div>

          {/* 4. Section: PENGIRIMAN */}
          <div className="kirim-po-section-block">
            <span className="kirim-po-section-heading">PENGIRIMAN</span>

            <label className="kirim-po-checkbox-row">
              <input
                type="checkbox"
                className="kirim-po-checkbox"
                checked={isSameAddress}
                onChange={handleToggleSameAddress}
              />
              <span className="kirim-po-checkbox-text">Sama dengan alamat perusahaan</span>
            </label>

            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Alamat tersimpan</label>
              <select
                className="kirim-po-select"
                value={selectedAddressIdx}
                onChange={handleChangeAlamatTersimpan}
              >
                {initAddresses.length > 0 ? (
                  initAddresses.map((addr, idx) => (
                    <option key={addr.id || idx} value={idx}>
                      {addr.label || `Alamat ${idx + 1}`}{addr.isPrimary ? ' (utama)' : ''}
                    </option>
                  ))
                ) : (
                  <option value={0}>— Belum ada alamat tersimpan —</option>
                )}
              </select>
            </div>

            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Alamat pengiriman</label>
              <textarea
                className="kirim-po-textarea"
                rows={2}
                value={alamatPengiriman}
                onChange={(e) => setAlamatPengiriman(e.target.value)}
                required
              />
            </div>

            <div className="kirim-po-grid-2">
              <div className="kirim-po-field-group">
                <label className="kirim-po-label">PIC penerima</label>
                <input
                  type="text"
                  className="kirim-po-input"
                  value={picPenerima}
                  onChange={(e) => setPicPenerima(e.target.value)}
                  required
                />
              </div>

              <div className="kirim-po-field-group">
                <label className="kirim-po-label">Telepon PIC</label>
                <input
                  type="text"
                  className="kirim-po-input"
                  value={teleponPic}
                  onChange={(e) => setTeleponPic(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Bottom Info Note */}
          <div className="kirim-po-info-note">
            <FiInfo size={15} className="info-note-icon" />
            <span>Data ini disimpan di Profil perusahaan untuk pesanan berikutnya.</span>
          </div>

          {/* Modal Footer Actions */}
          <div className="kirim-po-actions-footer">
            <button
              type="button"
              className="btn-kirim-po-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-kirim-po-submit"
              disabled={isSubmitting}
            >
              <FiUpload size={15} />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim PO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KirimPoModal;

