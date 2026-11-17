import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiMapPin, FiFileText } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import toast from 'react-hot-toast';

const UbahPesananModal = ({ isOpen, onClose, order, onSave }) => {
  const { products } = useDamaco();

  const [items, setItems] = useState([]);
  const [alamat, setAlamat] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedNewProdId, setSelectedNewProdId] = useState('');

  useEffect(() => {
    if (!isOpen || !order) return;
    const initialItems = (order.items && order.items.length > 0)
      ? order.items.map(it => ({
          productId: it.productId || it.id || '',
          nama: it.nama,
          harga: it.harga || 0,
          qty: it.qty || 1,
        }))
      : [
          {
            productId: 'PRD-1',
            nama: order.detail || 'Unit Drone Damaco',
            harga: order.total || 0,
            qty: 1,
          },
        ];
    setItems(initialItems);
    setAlamat(order.alamatPengiriman || order.alamat || '');
    setNotes(order.catatan || '');
    setSelectedNewProdId(products && products[0] ? String(products[0].id) : '');
  }, [isOpen, order, products]);

  // Guard after hooks
  if (!isOpen || !order) return null;

  const handleQtyChange = (index, delta) => {
    setItems(prev => {
      const next = [...prev];
      const newQty = Math.max(1, (next[index].qty || 1) + delta);
      next[index] = { ...next[index], qty: newQty };
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error('Pesanan harus memiliki minimal 1 produk. Jika ingin membatalkan semua, silakan gunakan tombol Batalkan Permintaan.');
      return;
    }
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddNewItem = () => {
    if (!selectedNewProdId) return;
    const foundProd = (products || []).find(p => String(p.id) === String(selectedNewProdId));
    if (!foundProd) return;

    // Check if item already exists
    const existingIdx = items.findIndex(it => it.nama.toLowerCase() === foundProd.nama.toLowerCase());
    if (existingIdx >= 0) {
      handleQtyChange(existingIdx, 1);
      toast.success(`Jumlah ${foundProd.nama} ditambah 1.`);
      return;
    }

    setItems(prev => [
      ...prev,
      {
        productId: foundProd.id,
        nama: foundProd.nama,
        harga: foundProd.harga || 0,
        qty: 1,
      },
    ]);
    toast.success(`${foundProd.nama} ditambahkan ke pesanan.`);
  };

  const subtotal = items.reduce((acc, it) => acc + ((it.qty || 1) * (it.harga || 0)), 0);
  const ppn = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + ppn;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Daftar barang tidak boleh kosong.');
      return;
    }
    if (!alamat.trim()) {
      toast.error('Alamat pengiriman unit tidak boleh kosong.');
      return;
    }

    const formattedItems = items.map(it => ({
      ...it,
      subtotal: (it.qty || 1) * (it.harga || 0),
    }));

    onSave({
      items: formattedItems,
      alamat: alamat.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="katalog-modal-backdrop" onClick={onClose}>
      <div
        className="katalog-modal-container ubah-pesanan-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="order-badge-quote" style={{ background: '#E8F1E9', color: '#286845' }}>
              UBAH RINCIAN PERMINTAAN
            </span>
            <h3 className="modal-title font-serif" style={{ marginTop: 4, fontSize: '18px' }}>
              Pesanan {order.nomor}
            </h3>
            <p className="modal-subtitle">
              Ubah jumlah unit, tambah produk lain, atau sesuaikan alamat pengiriman sebelum penawaran resmi diterbitkan.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <FiX size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {/* Section 1: Daftar Barang */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Daftar Barang & Jumlah Unit ({items.length})
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>
                      {it.nama}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Rp {(it.harga || 0).toLocaleString('id-ID')} / unit
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(idx, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                      }}
                    >
                      <FiMinus size={13} />
                    </button>
                    <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                      {it.qty || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(idx, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                      }}
                    >
                      <FiPlus size={13} />
                    </button>
                  </div>

                  {/* Subtotal Item */}
                  <div style={{ minWidth: 100, textAlign: 'right', fontWeight: 600, fontSize: 13.5, color: '#166534' }}>
                    Rp {((it.qty || 1) * (it.harga || 0)).toLocaleString('id-ID')}
                  </div>

                  {/* Delete Item Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    title="Hapus produk ini"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Product From Catalog */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 12,
                padding: '10px 12px',
                background: '#F1F5F9',
                borderRadius: '8px',
                alignItems: 'center',
              }}
            >
              <select
                value={selectedNewProdId}
                onChange={(e) => setSelectedNewProdId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: 12.5,
                  background: '#FFFFFF',
                  color: '#0F172A',
                }}
              >
                {(products || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — Rp {(p.harga || 0).toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddNewItem}
                style={{
                  background: '#286845',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <FiPlus size={14} />
                <span>Tambah Produk</span>
              </button>
            </div>
          </div>

          {/* Section 2: Alamat Pengiriman */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
              <FiMapPin size={14} color="#286845" />
              <span>Alamat Pengiriman Unit *</span>
            </label>
            <textarea
              rows={2}
              required
              className="field-input"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat pengiriman unit yang lengkap..."
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Section 3: Catatan Spesifikasi */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
              <FiFileText size={14} color="#286845" />
              <span>Catatan Tambahan / Spesifikasi Proyek</span>
            </label>
            <textarea
              rows={2}
              className="field-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Butuh surat dukungan distributor dan jadwal demo uji terbang..."
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Total Calculation Card */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#166534', marginBottom: 4 }}>
              <span>Subtotal (DPP)</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#166534', marginBottom: 6 }}>
              <span>PPN (11%)</span>
              <span>Rp {ppn.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ borderTop: '1px solid #86EFAC', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#14532D' }}>
              <span>Total Estimasi</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
              Batal
            </button>
            <button
              type="submit"
              style={{
                background: '#286845',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Simpan Perubahan Pesanan →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UbahPesananModal;

