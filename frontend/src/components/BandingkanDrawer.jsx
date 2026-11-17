import React from 'react';
import { FiX, FiPlus, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import DroneSvgIllustration from './DroneSvgIllustration';
import { formatRupiah } from '../utils/format';

const BandingkanDrawer = () => {
  const {
    compareList,
    toggleCompare,
    clearCompare,
    isCompareOpen,
    setIsCompareOpen,
    addToPermintaanCart,
  } = useDamaco();

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Bottom Floating Bar */}
      {!isCompareOpen && (
        <div className="compare-floating-bar">
          <div className="compare-bar-content">
            <div className="compare-chips-group">
              <span className="compare-bar-label">Perbandingan ({compareList.length}/3):</span>
              {compareList.map(item => (
                <div key={item.id} className="compare-mini-chip">
                  <span>{item.nama}</span>
                  <button type="button" onClick={() => toggleCompare(item)}>
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="compare-bar-actions">
              <button
                type="button"
                className="btn-text-subtle"
                onClick={clearCompare}
              >
                Hapus Semua
              </button>
              <button
                type="button"
                className="btn-compare-action"
                onClick={() => setIsCompareOpen(true)}
              >
                Bandingkan Sekarang ({compareList.length}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Comparison Modal */}
      {isCompareOpen && (
        <div className="katalog-modal-backdrop" onClick={() => setIsCompareOpen(false)}>
          <div className="katalog-modal-container compare-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="compare-modal-header">
              <div>
                <span className="compare-modal-eyebrow">FITUR KOMPARASI B2B</span>
                <h3 className="compare-modal-heading font-serif">Bandingkan Spesifikasi Drone & Perangkat</h3>
                <p className="compare-modal-sub">
                  Perbandingan parameter teknis langsung untuk memudahkan analisis dan evaluasi pengadaan perusahaan Anda.
                </p>
              </div>
              <button
                type="button"
                className="compare-modal-close-btn"
                onClick={() => setIsCompareOpen(false)}
                title="Tutup (Esc)"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Matrix Comparison Table */}
            <div className="compare-table-wrapper">
              <table className="compare-matrix-table">
                <thead>
                  <tr>
                    <th className="comp-col-param">Parameter Teknis</th>
                    {compareList.map(prod => (
                      <th key={prod.id} className="comp-col-product">
                        <div className="comp-head-card">
                          <button
                            type="button"
                            className="comp-head-remove-btn"
                            onClick={() => toggleCompare(prod)}
                            title="Hapus dari perbandingan"
                          >
                            <FiX size={13} />
                          </button>

                          <div className="comp-head-visual">
                            <DroneSvgIllustration height={100} />
                          </div>

                          <div className="comp-head-body">
                            <span className="comp-brand-badge">{prod.brand || 'DAMACO'}</span>
                            <h4 className="comp-prod-name font-serif">{prod.nama}</h4>
                            <div className="comp-price-box">
                              <span className="comp-price-val">Rp {formatRupiah(prod.harga)}</span>
                              <span className="comp-price-unit">/ {prod.satuan || 'unit'}</span>
                            </div>

                            <button
                              type="button"
                              className="btn-comp-add-primary"
                              onClick={() => addToPermintaanCart(prod, 1)}
                            >
                              <FiPlus size={14} />
                              <span>Tambah ke Permintaan</span>
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="row-param-name">Kategori & Keperluan</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <span className="comp-pill-badge">{p.kategori || 'Drone'}</span>
                        <span className="comp-pill-sub">{p.keperluan || 'Operasional'}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Durasi Terbang / Daya Tahan</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <strong className="comp-metric-highlight">{p.durasi || '-'}</strong>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Jarak Kontrol / Jangkauan</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <strong className="comp-metric-highlight">{p.jarak || '-'}</strong>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Kamera & Sensor Bawaan</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <span className="comp-sensor-text">{p.kamera || 'Opsional / Tambahan Modul'}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Bobot Operasional / MTOW</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <span>{p.berat || '-'}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Ketersediaan Stok</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <span className={`avail-tag ${p.ketersediaan || 'ready_stock'}`}>
                          {(!p.ketersediaan || p.ketersediaan === 'ready_stock') && '✓ Ready Stock (Gudang Cikarang)'}
                          {p.ketersediaan === 'stok_terbatas' && '⚠ Stok Terbatas (Sisa sedikit)'}
                          {p.ketersediaan === 'indent_14_hari' && '⏱ Indent 14 Hari Kerja'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Fitur Unggulan</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        {p.fitur && p.fitur.length > 0 ? (
                          <ul className="comp-feature-list">
                            {p.fitur.map((f, idx) => (
                              <li key={idx}>
                                <FiCheck size={13} className="comp-check-icon" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="comp-text-muted">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="row-param-name">Deskripsi & Keunggulan</td>
                    {compareList.map(p => (
                      <td key={p.id}>
                        <p className="comp-desc-text">{p.deskripsi || '-'}</p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="compare-modal-footer">
              <button
                type="button"
                className="btn-compare-clear"
                onClick={clearCompare}
              >
                Hapus Semua Perbandingan
              </button>
              <button
                type="button"
                className="btn-katalog-primary"
                onClick={() => setIsCompareOpen(false)}
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BandingkanDrawer;

