import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiUpload,
  FiFileText,
  FiCheck,
  FiAlertCircle,
  FiCreditCard,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const UploadBuktiPembayaranModal = ({ isOpen, onClose, order, onSubmitProof }) => {
  // ⚠️ Semua hooks WAJIB dipanggil sebelum return kondisional (Rules of Hooks)
  const [fileBukti, setFileBukti] = useState(null);
  const [bankPengirim, setBankPengirim] = useState('Bank Mandiri');
  const [namaPengirim, setNamaPengirim] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seed state dari data order saat modal dibuka
  useEffect(() => {
    if (!isOpen || !order) return;
    setFileBukti(null);
    setBankPengirim('Bank Mandiri');
    setNamaPengirim(order.customerNama || order.contact || '');
    setCatatan('');
    setIsSubmitting(false);
  }, [isOpen, order]);

  // Guard setelah semua hooks — aman di sini
  if (!isOpen || !order) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileBukti(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileBukti(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileBukti) {
      toast.error('Mohon lampirkan struk / foto bukti pembayaran Anda.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitProof({
        orderId: order.id,
        orderNomor: order.nomor,
        fileName: fileBukti.name,
        bankPengirim,
        namaPengirim,
        catatan,
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="kirim-po-modal-backdrop" onClick={onClose}>
      <div className="kirim-po-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="kirim-po-header">
          <div className="kirim-po-header-titles">
            <h2 className="kirim-po-title font-serif">Unggah Bukti Pembayaran</h2>
            <p className="kirim-po-subtitle">
              Untuk pesanan <strong>{order?.nomor || '-'}</strong> • Rp {(order?.total || 0).toLocaleString('id-ID')}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="kirim-po-form-body">
          {/* Info Rekening Penerima */}
          <div className="context-bank-box" style={{ margin: '0 0 16px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="bank-lead">
              <FiCreditCard size={15} />
              <strong>Transfer ke Rekening Resmi Damaco:</strong>
            </div>
            <div className="bank-account-num" style={{ fontSize: 18 }}>123-00-9988776-5</div>
            <small className="bank-holder">Bank Mandiri • a/n PT Damaco Teknologi Presisi</small>
          </div>

          {/* Upload Dropzone */}
          <div className="kirim-po-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="kirim-po-label" style={{ margin: 0 }}>
                Foto / Dokumen Bukti Transfer <span style={{ color: '#E53935' }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: fileBukti ? '#22C55E' : '#94A3B8' }}>
                {fileBukti ? '✓ Berkas terpilih' : 'Wajib diunggah'}
              </span>
            </div>

            <div
              className={`kirim-po-dropzone ${fileBukti ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('bukti-bayar-input').click()}
            >
              <input
                id="bukti-bayar-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="dropzone-icon-circle">
                <FiUpload size={20} />
              </div>

              {fileBukti ? (
                <div className="dropzone-file-info">
                  <div className="dropzone-file-name">
                    <FiFileText size={15} />
                    <span>{fileBukti.name}</span>
                  </div>
                  <span className="dropzone-file-size">
                    {(fileBukti.size / 1024 / 1024).toFixed(2)} MB • Siap dikirim
                  </span>
                  <span className="dropzone-change-text">Klik untuk mengganti berkas</span>
                </div>
              ) : (
                <div className="dropzone-prompt">
                  <span className="dropzone-main-text">
                    Tarik file ke sini atau <u className="dropzone-underline">pilih file</u>
                  </span>
                  <span className="dropzone-sub-text">Format JPG, PNG, atau PDF (maks. 10 MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: Bank Asal & Atas Nama Rekening */}
          <div className="kirim-po-grid-2">
            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Bank Pengirim</label>
              <input
                type="text"
                className="kirim-po-input"
                placeholder="Contoh: Mandiri, BCA, BNI, BRI"
                value={bankPengirim}
                onChange={(e) => setBankPengirim(e.target.value)}
                required
              />
            </div>
            <div className="kirim-po-field-group">
              <label className="kirim-po-label">Nama Pemilik Rekening</label>
              <input
                type="text"
                className="kirim-po-input"
                placeholder="Nama pengirim transfer"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="kirim-po-field-group">
            <label className="kirim-po-label">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              className="kirim-po-input"
              placeholder="Nomor referensi atau catatan pembayaran..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          {/* Info Helper */}
          <div className="kirim-po-info-note">
            <FiInfo size={15} className="info-note-icon" />
            <span>Setelah diunggah, tim Finance Damaco akan memverifikasi dan pesanan akan otomatis berganti status menjadi Siap Dikirim.</span>
          </div>

          {/* Action Buttons */}
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
              <FiCheck size={16} />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadBuktiPembayaranModal;

