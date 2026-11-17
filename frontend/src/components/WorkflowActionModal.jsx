import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiFileText, FiBriefcase, FiDollarSign, FiPrinter } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';

const WorkflowActionModal = () => {
  const {
    modalActionOrder,
    setModalActionOrder,
    activeActionModalType,
    setActiveActionModalType,
    handleTerbitkanPenawaran,
    handleInputPO,
    handleUrusDealer,
    handleBuatInvoice,
  } = useDamaco();

  const [poNumber, setPoNumber] = useState('');
  const [dealerNote, setDealerNote] = useState('Damaco Authorized Partner Hub Jakarta (Unit Alokasi Ready)');

  // Form input penerbitan penawaran
  const [masaBerlaku, setMasaBerlaku] = useState('14 Hari Kerja');
  const [metodePengiriman, setMetodePengiriman] = useState('Damaco Direct Secure Courier + Asuransi Transit Penuh');
  const [syaratPembayaran, setSyaratPembayaran] = useState('Transfer Bank Mandiri (100% Full Payment sebelum kirim)');
  const [catatanPenawaran, setCatatanPenawaran] = useState('Unit lolos uji kalibrasi pra-pengiriman standard ISO 9001:2015.');

  useEffect(() => {
    if (modalActionOrder) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setPoNumber(`PO/${new Date().getFullYear()}/${modalActionOrder.customerNama.slice(0, 3).toUpperCase()}/${randomSuffix}`);
    }
  }, [modalActionOrder]);

  if (!activeActionModalType || !modalActionOrder) return null;

  const handleClose = () => {
    setActiveActionModalType(null);
    setModalActionOrder(null);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (activeActionModalType === 'terbitkan_penawaran') {
      handleTerbitkanPenawaran(modalActionOrder.id, {
        nomorPenawaran: modalActionOrder.nomor,
        masaBerlaku,
        metodePengiriman,
        syaratPembayaran,
        catatan: catatanPenawaran,
      });
      setActiveActionModalType(null);
    } else if (activeActionModalType === 'input_po') {
      handleInputPO(modalActionOrder.id, poNumber);
    } else if (activeActionModalType === 'urus_dealer') {
      handleUrusDealer(modalActionOrder.id, dealerNote);
    } else if (activeActionModalType === 'buat_invoice') {
      handleBuatInvoice(modalActionOrder.id);
      setActiveActionModalType(null);
    }
    setModalActionOrder(null);
  };

  return (
    <div className="damaco-modal-backdrop" onClick={handleClose}>
      <div className="damaco-modal-container form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: activeActionModalType === 'buat_invoice' ? 660 : 520 }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-badge-icon" style={{ background: '#E8F5E9', color: '#286845' }}>
              {activeActionModalType === 'terbitkan_penawaran' && <FiFileText />}
              {activeActionModalType === 'input_po' && <FiFileText />}
              {activeActionModalType === 'urus_dealer' && <FiBriefcase />}
              {activeActionModalType === 'buat_invoice' && <FiDollarSign />}
            </div>
            <div>
              <h2 className="modal-title font-serif">
                {activeActionModalType === 'terbitkan_penawaran' && 'Terbitkan Surat Penawaran Resmi'}
                {activeActionModalType === 'input_po' && 'Input Purchase Order (PO)'}
                {activeActionModalType === 'urus_dealer' && 'Koordinasi & Urus Dealer'}
                {activeActionModalType === 'buat_invoice' && 'Penerbitan Invoice Tagihan'}
              </h2>
              <p className="modal-subtitle">{modalActionOrder.nomor} — {modalActionOrder.customerNama}</p>
            </div>
          </div>
          <button className="portal-btn-close" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="modal-body">
          {activeActionModalType === 'terbitkan_penawaran' && (
            <>
              <div className="form-section">
                <label className="damaco-label">Nomor Dokumen Penawaran</label>
                <input
                  type="text"
                  disabled
                  className="damaco-input"
                  value={modalActionOrder.nomor}
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-section">
                  <label className="damaco-label">Masa Berlaku Penawaran *</label>
                  <select
                    className="damaco-input select-styled"
                    value={masaBerlaku}
                    onChange={(e) => setMasaBerlaku(e.target.value)}
                    required
                  >
                    <option value="7 Hari Kerja">7 Hari Kerja</option>
                    <option value="14 Hari Kerja">14 Hari Kerja</option>
                    <option value="30 Hari Kalender">30 Hari Kalender</option>
                  </select>
                </div>
                <div className="form-section">
                  <label className="damaco-label">Metode Pengiriman *</label>
                  <select
                    className="damaco-input select-styled"
                    value={metodePengiriman}
                    onChange={(e) => setMetodePengiriman(e.target.value)}
                    required
                  >
                    <option value="Damaco Direct Secure Courier + Asuransi Transit Penuh">Damaco Direct Secure Courier</option>
                    <option value="Pengambilan Mandiri di Gudang Cikarang">Ambil Mandiri (Gudang Cikarang)</option>
                    <option value="Ekspedisi Khusus Kargo Udara (Luar Pulau)">Kargo Udara (Luar Pulau)</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <label className="damaco-label">Syarat & Ketentuan Pembayaran *</label>
                <input
                  type="text"
                  required
                  className="damaco-input"
                  value={syaratPembayaran}
                  onChange={(e) => setSyaratPembayaran(e.target.value)}
                  placeholder="Contoh: Transfer Bank Mandiri (100% Full Payment sebelum kirim)"
                />
              </div>

              <div className="form-section">
                <label className="damaco-label">Catatan Tambahan Penawaran</label>
                <textarea
                  className="damaco-input"
                  rows={2}
                  value={catatanPenawaran}
                  onChange={(e) => setCatatanPenawaran(e.target.value)}
                  placeholder="Catatan garansi, ketersediaan unit, atau ketentuan teknis..."
                />
              </div>

              <div className="form-section">
                <label className="damaco-label">Ringkasan Nilai Penawaran</label>
                <div style={{ background: '#FAF8F5', padding: 12, borderRadius: 8, fontSize: 13, border: '1px solid #EBE7DF' }}>
                  <div>Total Nilai: <strong style={{ color: '#286845' }}>Rp {modalActionOrder.total?.toLocaleString('id-ID')}</strong></div>
                  <div style={{ color: '#64748B', marginTop: 4 }}>Produk: {modalActionOrder.detail}</div>
                </div>
              </div>
            </>
          )}
          {activeActionModalType === 'input_po' && (
            <>
              <div className="form-section">
                <label className="damaco-label">Nomor PO Resmi Customer *</label>
                <input
                  type="text"
                  required
                  className="damaco-input"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Contoh: PO/2026/NG/4912"
                />
              </div>
              <div className="form-section">
                <label className="damaco-label">Rincian Dokumen PO</label>
                <div style={{ background: '#FAF8F5', padding: 12, borderRadius: 8, fontSize: 13, border: '1px solid #EBE7DF' }}>
                  <div>Nilai Disepakati: <strong>Rp {modalActionOrder.total.toLocaleString('id-ID')}</strong></div>
                  <div style={{ color: '#64748B', marginTop: 4 }}>Produk: {modalActionOrder.detail}</div>
                </div>
              </div>
            </>
          )}

          {activeActionModalType === 'urus_dealer' && (
            <>
              <div className="form-section">
                <label className="damaco-label">Pilih / Catat Alokasi Dealer *</label>
                <select
                  className="damaco-input select-styled"
                  value={dealerNote}
                  onChange={(e) => setDealerNote(e.target.value)}
                >
                  <option value="Damaco Authorized Partner Hub Jakarta (Unit Alokasi Ready)">
                    Damaco Authorized Partner Hub Jakarta (Unit Alokasi Ready)
                  </option>
                  <option value="Dealer Distribusi Wilayah Jawa Timur & Bali (Ready Stock)">
                    Dealer Distribusi Wilayah Jawa Timur & Bali (Ready Stock)
                  </option>
                  <option value="Principal Direct Import Clearance (Gudang Pusat Cikarang)">
                    Principal Direct Import Clearance (Gudang Pusat Cikarang)
                  </option>
                  <option value="Dealer Spesialis Sensor Survei Geospasial Bandung">
                    Dealer Spesialis Sensor Survei Geospasial Bandung
                  </option>
                </select>
              </div>
              <div className="form-section">
                <label className="damaco-label">Status Alokasi Unit</label>
                <div style={{ background: '#FAF8F5', padding: 12, borderRadius: 8, fontSize: 13, border: '1px solid #EBE7DF' }}>
                  <div style={{ color: '#16A34A', fontWeight: 600 }}>✓ Unit tersedia & lolos uji serial number dealer</div>
                  <div style={{ color: '#64748B', marginTop: 4 }}>Estimasi pengiriman tepat waktu setelah pembayaran lunas.</div>
                </div>
              </div>
            </>
          )}

          {activeActionModalType === 'buat_invoice' && (() => {
            const grandTotal = modalActionOrder.total || 0;
            const dpp = Math.round(grandTotal / 1.11);
            const ppn = grandTotal - dpp;
            const today = new Date();
            const nomorInvoice = `INV/${today.getFullYear()}/${String(today.getMonth()+1).padStart(2,'0')}/${modalActionOrder.nomor?.slice(-4) || '0001'}`;
            const jatuhTempo = new Date(today); jatuhTempo.setDate(today.getDate() + 14);
            const fmtDate = (d) => d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
            const items = modalActionOrder.items || [{ nama: modalActionOrder.detail || 'Produk Damaco', qty: 1, harga: dpp }];
            return (
              <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
                {/* Kop Surat */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #286845' }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: '#286845', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18 }}>D</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#18251F' }}>PT Damaco Teknologi Presisi</div>
                      <div style={{ color: '#64748B', fontSize: 11 }}>Kawasan Industri Modern Cikarang Blok C-12, Bekasi</div>
                      <div style={{ color: '#64748B', fontSize: 11 }}>enterprise@damaco.id | (021) 8990-8800</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#286845', letterSpacing: 1 }}>INVOICE</div>
                    <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>No: <strong style={{color:'#18251F'}}>{nomorInvoice}</strong></div>
                    <div style={{ color: '#64748B', fontSize: 11 }}>Tanggal: {fmtDate(today)}</div>
                    <div style={{ color: '#64748B', fontSize: 11 }}>Jatuh Tempo: <strong style={{color:'#DC2626'}}>{fmtDate(jatuhTempo)}</strong></div>
                  </div>
                </div>

                {/* Kepada */}
                <div style={{ display:'flex', gap: 24, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 6, padding: '8px 12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#286845', letterSpacing: 1, marginBottom: 4 }}>DITAGIHKAN KEPADA:</div>
                    <div style={{ fontWeight: 700, color: '#18251F' }}>{modalActionOrder.customerNama}</div>
                    <div style={{ color: '#64748B', fontSize: 11 }}>Up. Divisi Pengadaan & Operasional</div>
                    <div style={{ color: '#64748B', fontSize: 11 }}>Ref PO: {modalActionOrder.nomorPo || '-'}</div>
                  </div>
                  <div style={{ flex: 1, background: '#F0FDF4', borderRadius: 6, padding: '8px 12px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#286845', letterSpacing: 1, marginBottom: 4 }}>INSTRUKSI PEMBAYARAN:</div>
                    <div style={{ fontWeight: 600, color: '#18251F', fontSize: 12 }}>Bank Mandiri (Persero) Tbk</div>
                    <div style={{ color: '#18251F', fontSize: 13, fontWeight: 700 }}>123-00-9988776-5</div>
                    <div style={{ color: '#64748B', fontSize: 11 }}>a/n PT Damaco Teknologi Presisi</div>
                  </div>
                </div>

                {/* Tabel Item */}
                <table style={{ width:'100%', borderCollapse:'collapse', marginBottom: 10, fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#286845', color: '#fff' }}>
                      <th style={{ padding: '6px 8px', textAlign:'left', borderRadius: '4px 0 0 0', width: 24 }}>No</th>
                      <th style={{ padding: '6px 8px', textAlign:'left' }}>Deskripsi</th>
                      <th style={{ padding: '6px 8px', textAlign:'center', width: 40 }}>Qty</th>
                      <th style={{ padding: '6px 8px', textAlign:'right', width: 110 }}>Harga Satuan</th>
                      <th style={{ padding: '6px 8px', textAlign:'right', borderRadius: '0 4px 0 0', width: 110 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                        <td style={{ padding: '7px 8px', color: '#64748B' }}>{i+1}</td>
                        <td style={{ padding: '7px 8px', fontWeight: 500 }}>
                          <div>{item.nama || item.name || modalActionOrder.detail}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Garansi Resmi Damaco Enterprise 2 Tahun + Support Teknis 24/7</div>
                        </td>
                        <td style={{ padding: '7px 8px', textAlign:'center' }}>{item.qty || 1}</td>
                        <td style={{ padding: '7px 8px', textAlign:'right' }}>Rp {(item.harga || dpp).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '7px 8px', textAlign:'right', fontWeight: 600 }}>Rp {((item.harga || dpp) * (item.qty || 1)).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div style={{ width: 220, fontSize: 12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', padding: '4px 0', borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ color:'#64748B' }}>Subtotal (DPP)</span>
                      <span>Rp {dpp.toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', padding: '4px 0', borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ color:'#64748B' }}>PPN 11%</span>
                      <span>Rp {ppn.toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', padding: '6px 0', fontWeight: 700, fontSize: 14, color: '#286845' }}>
                      <span>Grand Total</span>
                      <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 10, padding: '8px 10px', background: '#FFF7ED', borderRadius: 6, border: '1px solid #FED7AA', fontSize: 11, color: '#92400E' }}>
                  ⚠ Mohon cantumkan nomor referensi <strong>{nomorInvoice}</strong> pada berita transfer. Faktur Pajak Elektronik akan diterbitkan setelah pembayaran diterima.
                </div>
              </div>
            );
          })()}

          <div className="order-modal-footer">
            <button type="button" className="btn-damaco-cancel" onClick={handleClose}>
              Batal
            </button>
            <button type="submit" className="btn-damaco-primary">
              {activeActionModalType === 'terbitkan_penawaran' && 'Terbitkan Surat Penawaran →'}
              {activeActionModalType === 'input_po' && 'Simpan & Lanjut Urus Dealer →'}
              {activeActionModalType === 'urus_dealer' && 'Selesaikan Urus Dealer →'}
              {activeActionModalType === 'buat_invoice' && 'Terbitkan Invoice Resmi →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowActionModal;

