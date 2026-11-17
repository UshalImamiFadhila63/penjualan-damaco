import React, { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';

const KelolaCustomerPage = () => {
  const {
    customers,
    handleSaveCustomer,
    handleDeleteCustomer,
    setIsCreateOrderModalOpen,
    orders,
  } = useDamaco();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    contact: '',
    email: '',
    telepon: '',
    alamat: '',
  });

  const filteredCustomers = customers.filter(c =>
    c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setForm({
      nama: '',
      contact: '',
      email: '',
      telepon: '',
      alamat: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setForm({
      nama: c.nama,
      contact: c.contact,
      email: c.email,
      telepon: c.telepon,
      alamat: c.alamat || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveCustomer({
      id: editingCustomer?.id,
      nama: form.nama,
      contact: form.contact,
      email: form.email,
      telepon: form.telepon,
      alamat: form.alamat,
      totalPesanan: editingCustomer?.totalPesanan || 0,
      totalNilai: editingCustomer?.totalNilai || 0,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="damaco-subpage-wrapper">
      <div className="subpage-header">
        <div>
          <h1 className="subpage-title font-serif">Kelola Customer</h1>
          <p className="subpage-subtitle">Daftar klien korporat, B2B partner, dan instansi pemerintah pengguna Damaco</p>
        </div>
      </div>

      <div className="damaco-table-card">
        <div className="table-controls-bar">
          <div className="table-search-box" style={{ maxWidth: 360 }}>
            <FiSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Cari nama perusahaan atau kontak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 13, color: '#64748B' }}>
            Total <strong>{customers.length}</strong> klien aktif
          </div>
        </div>

        <div className="customer-cards-grid">
          {filteredCustomers.map(c => {
            const customerOrders = orders.filter(o => o.customerNama === c.nama);
            const totalValue = customerOrders.reduce((acc, o) => acc + o.total, 0);

            return (
              <div key={c.id} className="customer-profile-card">
                <div className="cust-card-top">
                  <div className="cust-avatar-large">
                    {c.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="cust-main-info">
                    <h3 className="cust-company-name font-serif">{c.nama}</h3>
                    <p className="cust-contact-person">PIC: {c.contact}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="btn-icon-table"
                      onClick={() => handleOpenEdit(c)}
                      title="Edit customer"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn-icon-table"
                      onClick={() => handleDeleteCustomer(c)}
                      title="Hapus customer"
                      style={{ color: '#DC2626' }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="cust-divider" />

                <div className="cust-details-list">
                  <div className="cust-detail-item">
                    <FiMail className="detail-icon" />
                    <span>{c.email}</span>
                  </div>
                  <div className="cust-detail-item">
                    <FiPhone className="detail-icon" />
                    <span>{c.telepon}</span>
                  </div>
                  <div className="cust-detail-item">
                    <FiMapPin className="detail-icon" />
                    <span>{c.alamat}</span>
                  </div>
                </div>

                <div className="cust-card-footer">
                  <div className="cust-stat-pill">
                    <span className="lbl">Total Order:</span>
                    <span className="val">{customerOrders.length || c.totalPesanan} Pesanan</span>
                  </div>
                  <div className="cust-stat-pill highlight">
                    <span className="lbl">Akumulasi:</span>
                    <span className="val">Rp {(totalValue || c.totalNilai).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="damaco-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="damaco-modal-container form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title font-serif">
                {editingCustomer ? 'Edit Profil Customer' : 'Tambah Customer Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <label className="damaco-label">Nama Perusahaan / Instansi *</label>
                <input
                  type="text"
                  required
                  className="damaco-input"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: PT Nusantara Geospasial"
                />
              </div>

              <div className="form-section">
                <label className="damaco-label">Nama Kontak (PIC) *</label>
                <input
                  type="text"
                  required
                  className="damaco-input"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="Contoh: Hendra Wijaya"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-section">
                  <label className="damaco-label">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    className="damaco-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-section">
                  <label className="damaco-label">Nomor Telepon *</label>
                  <input
                    type="text"
                    required
                    className="damaco-input"
                    value={form.telepon}
                    onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-section">
                <label className="damaco-label">Alamat Kantor / Pengiriman</label>
                <textarea
                  rows={2}
                  className="damaco-input textarea-styled"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
              </div>

              <div className="order-modal-footer" style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {editingCustomer && (
                    <button
                      type="button"
                      className="btn-damaco-cancel"
                      onClick={() => {
                        setIsModalOpen(false);
                        handleDeleteCustomer(editingCustomer);
                      }}
                      style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                    >
                      <FiTrash2 style={{ marginRight: 6 }} /> Hapus Customer
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-damaco-cancel"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-damaco-primary">
                    {editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Customer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaCustomerPage;

