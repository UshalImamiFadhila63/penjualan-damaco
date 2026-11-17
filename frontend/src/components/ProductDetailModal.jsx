import React from 'react';
import { FiX, FiCheck, FiPlus, FiShield, FiTruck, FiClock, FiMaximize2, FiAward } from 'react-icons/fi';
import DroneSvgIllustration from './DroneSvgIllustration';
import { useDamaco } from '../context/DamacoContext';
import { formatRupiah } from '../utils/format';

const ProductDetailModal = () => {
  const {
    isProductDetailOpen,
    setIsProductDetailOpen,
    selectedProductDetail,
    addToPermintaanCart,
    toggleCompare,
    compareList,
  } = useDamaco();

  if (!isProductDetailOpen || !selectedProductDetail) return null;

  const p = selectedProductDetail;
  const isCompared = compareList.some(item => String(item.id) === String(p.id));

  return (
    <div className="katalog-modal-backdrop" onClick={() => setIsProductDetailOpen(false)}>
      <div className="katalog-modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="detail-modal-badges">
            <span className="brand-chip">{p.brand}</span>
            <span className="category-chip">{p.kategori} • {p.keperluan}</span>
            {p.isPilihan && <span className="pilihan-chip">★ {p.badgeText || 'Pilihan tim survei'}</span>}
          </div>
          <button className="modal-close-btn" onClick={() => setIsProductDetailOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <div className="detail-modal-grid">
          {/* Visual Column */}
          <div className="detail-visual-col">
            <div className="detail-illustration-box">
              <DroneSvgIllustration height={240} />
            </div>
            <div className="detail-quick-specs">
              <div className="q-spec-item">
                <FiClock className="q-icon" />
                <div>
                  <span className="q-label">Durasi Terbang</span>
                  <strong className="q-val">{p.durasi || '45-55 mnt'}</strong>
                </div>
              </div>
              <div className="q-spec-item">
                <FiTruck className="q-icon" />
                <div>
                  <span className="q-label">Jarak Kontrol</span>
                  <strong className="q-val">{p.jarak || '15 km'}</strong>
                </div>
              </div>
              <div className="q-spec-item">
                <FiMaximize2 className="q-icon" />
                <div>
                  <span className="q-label">Bobot / Sensor</span>
                  <strong className="q-val">{p.berat || '0,9 kg'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="detail-info-col">
            <h2 className="detail-title font-serif">{p.nama}</h2>
            <div className="detail-price-box">
              <span className="price-main font-serif">Rp {formatRupiah(p.harga)}</span>
              <span className="price-sub">Harga net, sudah termasuk PPN 11% & faktur resmi</span>
            </div>

            <p className="detail-desc">{p.deskripsi}</p>

            {/* Features List */}
            {p.fitur && p.fitur.length > 0 && (
              <div className="detail-features-wrap">
                <h4 className="features-head">Spesifikasi Unggulan:</h4>
                <ul className="features-list">
                  {p.fitur.map((f, i) => (
                    <li key={i}>
                      <FiCheck className="feat-check" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Warranty & Dealer Guarantee */}
            <div className="detail-warranty-card">
              <FiShield className="warranty-icon" />
              <div>
                <strong>Garansi Resmi Damaco Enterprise 2 Tahun</strong>
                <p>Termasuk kalibrasi gratis 2x setahun, penggantian suku cadang orisinil, dan unit pengganti sementara selama masa servis.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions-row">
              <button
                type="button"
                className={`btn-detail-compare ${isCompared ? 'active' : ''}`}
                onClick={() => toggleCompare(p)}
              >
                {isCompared ? '✓ Diperbandingkan' : 'Bandingkan Unit'}
              </button>

              <button
                type="button"
                className="btn-katalog-primary btn-large"
                onClick={() => {
                  addToPermintaanCart(p, 1);
                  setIsProductDetailOpen(false);
                }}
              >
                <FiPlus size={16} /> Tambah ke Permintaan Penawaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

