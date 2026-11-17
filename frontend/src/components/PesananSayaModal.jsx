import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiClock, FiTruck, FiFileText, FiPrinter } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';

const PesananSayaModal = () => {
  const {
    isPesananSayaOpen,
    setIsPesananSayaOpen,
    orders,
    openCustomerView,
  } = useDamaco();

  const [filterQuery, setFilterQuery] = useState('');

  if (!isPesananSayaOpen) return null;

  // Filter orders for customer view (all active orders or search)
  const myOrders = orders.filter(o => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return o.nomor.toLowerCase().includes(q) || o.customerNama.toLowerCase().includes(q);
  });

  const getStepProgress = (actionGroup) => {
    switch (actionGroup) {
      case 'terbitkan_penawaran': return { step: 1, label: 'Menunggu Penawaran' };
      case 'input_po': return { step: 2, label: 'Menunggu Input PO' };
      case 'urus_dealer': return { step: 3, label: 'Koordinasi Dealer' };
      case 'buat_invoice': return { step: 4, label: 'Penerbitan Invoice' };
      case 'tandai_lunas': return { step: 5, label: 'Menunggu Pembayaran' };
      case 'kirim_barang': return { step: 6, label: 'Pengemasan & Siap Kirim' };
      case 'dalam_pengiriman_berjalan': return { step: 6, label: 'Sedang Dikirim' };
      case 'tutup_transaksi': return { step: 7, label: 'Barang Diterima Customer' };
      case 'selesai': return { step: 8, label: 'Pesanan Selesai' };
      default: return { step: 1, label: 'Proses' };
    }
  };

  return (
    <div className="katalog-modal-backdrop" onClick={() => setIsPesananSayaOpen(false)}>
      <div className="katalog-modal-container orders-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title font-serif">Status & Riwayat Pesanan Pengadaan</h3>
            <p className="modal-subtitle">Pantau seluruh status quotation, nomor PO, invoice, hingga pengiriman unit Damaco</p>
          </div>
          <button className="modal-close-btn" onClick={() => setIsPesananSayaOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <div className="orders-search-bar" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Cari nomor quotation (misal: QT/2026/10/0012) atau nama instansi..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="field-input"
            />
          </div>

          <div className="orders-cards-list">
            {myOrders.slice(0, 6).map(order => {
              const { step, label } = getStepProgress(order.actionGroup);
              const progressPct = Math.min(100, Math.round((step / 8) * 100));

              return (
                <div key={order.id} className="customer-order-card">
                  <div className="order-card-top">
                    <div>
                      <span className="order-badge-quote">{order.nomor}</span>
                      <h4 className="order-instansi-name font-serif">{order.customerNama}</h4>
                      <p className="order-items-summary">{order.detail}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="order-total-price">Rp {order.total.toLocaleString('id-ID')}</div>
                      <span className="order-date-tag">{order.tanggal}</span>
                    </div>
                  </div>

                  {/* Progress Step Bar */}
                  <div className="order-progress-track">
                    <div className="track-bar-bg">
                      <div className="track-bar-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="track-status-text">
                      <span>Status Langkah: <strong>{label}</strong></span>
                      <span>Tahap {step} dari 8</span>
                    </div>
                  </div>

                  <div className="order-card-actions">
                    <button
                      type="button"
                      className="btn-view-doc"
                      onClick={() => {
                        openCustomerView(order);
                        setIsPesananSayaOpen(false);
                      }}
                    >
                      <FiPrinter size={13} /> Lihat Dokumen Penawaran Resmi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PesananSayaModal;

