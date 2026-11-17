import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

const BatalPesananModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [alasan, setAlasan] = useState('Perubahan kebutuhan proyek / spesifikasi teknis');
  const [alasanLain, setAlasanLain] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = alasan === 'Lainnya' ? (alasanLain.trim() || 'Dibatalkan oleh customer') : alasan;
    onConfirm(order.id || order.nomor, finalReason);
    onClose();
  };

  return (
    <div className="katalog-modal-backdrop" onClick={onClose}>
      <div
        className="katalog-modal-container batal-pesanan-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h3 className="modal-title font-serif" style={{ fontSize: '18px', color: '#991B1B' }}>
                Batalkan Permintaan?
              </h3>
              <p className="modal-subtitle" style={{ color: '#7F1D1D' }}>
                Pesanan <strong>{order.nomor}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
            Permintaan penawaran harga ini belum diterbitkan oleh tim Damaco. Jika dibatalkan, status akan dipindahkan ke tab <strong>"Tidak Aktif"</strong> dan admin tidak akan memproses penawaran resmi.
          </p>

          {/* Reason Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
              Alasan Pembatalan:
            </label>
            <select
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="field-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="Perubahan kebutuhan proyek / spesifikasi teknis">
                Perubahan kebutuhan proyek / spesifikasi teknis
              </option>
              <option value="Penyesuaian anggaran perusahaan">
                Penyesuaian anggaran perusahaan
              </option>
              <option value="Salah memilih produk atau jumlah unit">
                Salah memilih produk atau jumlah unit
              </option>
              <option value="Lainnya">Lainnya...</option>
            </select>
          </div>

          {alasan === 'Lainnya' && (
            <div style={{ marginBottom: 16 }}>
              <textarea
                rows={2}
                required
                className="field-input"
                placeholder="Tuliskan alasan pembatalan..."
                value={alasanLain}
                onChange={(e) => setAlasanLain(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Kembali
            </button>
            <button
              type="submit"
              style={{
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FiTrash2 size={14} />
              <span>Ya, Batalkan Permintaan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatalPesananModal;

