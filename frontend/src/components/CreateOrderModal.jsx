import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import toast from 'react-hot-toast';

const CreateOrderModal = () => {
  const {
    isCreateOrderModalOpen,
    setIsCreateOrderModalOpen,
    customers,
    products,
    handleCreateOrder,
  } = useDamaco();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [orderItems, setOrderItems] = useState([
    {
      productId: products[0]?.id || '',
      nama: products[0]?.nama || '',
      harga: products[0]?.harga || 0,
      qty: 1,
      subtotal: products[0]?.harga || 0,
    },
  ]);
  const [catatan, setCatatan] = useState('');

  if (!isCreateOrderModalOpen) return null;

  const handleProductChange = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setOrderItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: prod.id,
        nama: prod.nama,
        harga: prod.harga,
        subtotal: prod.harga * next[index].qty,
      };
      return next;
    });
  };

  const handleQtyChange = (index, qty) => {
    const safeQty = Math.max(1, parseInt(qty) || 1);
    setOrderItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        qty: safeQty,
        subtotal: next[index].harga * safeQty,
      };
      return next;
    });
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    setOrderItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || '',
        nama: firstProd?.nama || '',
        harga: firstProd?.harga || 0,
        qty: 1,
        subtotal: firstProd?.harga || 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length === 1) {
      toast.error('Pesanan harus memiliki minimal 1 item produk');
      return;
    }
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = orderItems.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) {
      toast.error('Silakan pilih customer');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Pilih minimal 1 produk');
      return;
    }

    handleCreateOrder({
      customerId: cust.id,
      customerNama: cust.nama,
      items: orderItems,
      total: totalAmount,
      catatan,
    });
  };

  return (
    <div className="damaco-modal-backdrop" onClick={() => setIsCreateOrderModalOpen(false)}>
      <div className="damaco-modal-container form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-badge-icon">
              <FiShoppingBag />
            </div>
            <div>
              <h2 className="modal-title">Buat Pesanan untuk Customer</h2>
              <p className="modal-subtitle">Terbitkan penawaran harga resmi (Quotation) baru untuk klien Damaco</p>
            </div>
          </div>
          <button className="portal-btn-close" onClick={() => setIsCreateOrderModalOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Customer Selection */}
          <div className="form-section">
            <label className="damaco-label">Pilih Customer *</label>
            <select
              className="damaco-input select-styled"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.contact} - {c.telepon})
                </option>
              ))}
            </select>
          </div>

          {/* Product Items Table */}
          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="damaco-label">Daftar Produk Pesanan *</label>
              <button
                type="button"
                className="btn-add-line"
                onClick={handleAddItem}
              >
                <FiPlus /> Tambah Produk
              </button>
            </div>

            <div className="order-items-table-wrap">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Produk Damaco</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Harga Satuan</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Subtotal</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="damaco-input select-table"
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nama} (Stok: {p.stok})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>
                        Rp {item.harga.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="damaco-input qty-input"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-trash"
                          onClick={() => handleRemoveItem(index)}
                          title="Hapus baris"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <label className="damaco-label">Catatan Tambahan (Opsional)</label>
            <textarea
              className="damaco-input textarea-styled"
              placeholder="Contoh: Pengadaan drone kuartal 4, garansi khusus 2 tahun, termin pembayaran 30 hari."
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          {/* Total & Submit */}
          <div className="order-modal-footer">
            <div className="order-total-display">
              <span className="total-label">Estimasi Nilai Penawaran:</span>
              <span className="total-value">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="order-footer-btns">
              <button
                type="button"
                className="btn-damaco-cancel"
                onClick={() => setIsCreateOrderModalOpen(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn-damaco-primary">
                Terbitkan Pesanan →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;

