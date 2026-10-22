import { useState, useEffect } from 'react';
import { produkService, kategoriService } from '../services';
import { formatRupiah, truncate } from '../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM = {
  kode_produk: '', nama: '', deskripsi: '', kategori_id: '',
  supplier_id: '', harga_beli: '', harga_jual: '', stok: '',
  stok_minimum: '5', satuan: 'pcs',
};

const ProdukPage = () => {
  const { isAdmin, user } = useAuth();
  const canEdit = isAdmin || user?.role === 'gudang';

  const [produk, setProduk] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProduk = async () => {
    setLoading(true);
    try {
      const res = await produkService.getAll({ search, page, limit: 10 });
      setProduk(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, [search, page]);

  useEffect(() => {
    kategoriService.getAll().then(res => setKategori(res.data.data));
  }, []);

  const openAdd = () => {
    setEditData(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setForm({
      kode_produk: item.kode_produk,
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      kategori_id: item.kategori_id || '',
      supplier_id: item.supplier_id || '',
      harga_beli: item.harga_beli,
      harga_jual: item.harga_jual,
      stok: item.stok,
      stok_minimum: item.stok_minimum,
      satuan: item.satuan,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await produkService.update(editData.id, form);
        toast.success('Produk berhasil diupdate');
      } else {
        await produkService.create(form);
        toast.success('Produk berhasil ditambahkan');
      }
      setShowModal(false);
      fetchProduk();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus produk "${nama}"?`)) return;
    try {
      await produkService.delete(id);
      toast.success('Produk berhasil dihapus');
      fetchProduk();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus produk');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Produk</h1>
          <p className="page-subtitle">Total {pagination.total || 0} produk terdaftar</p>
        </div>
        {canEdit && (
          <button id="btn-tambah-produk" className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> Tambah Produk
          </button>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-input-icon" />
          <input
            id="search-produk"
            type="text"
            className="search-input"
            placeholder="Cari nama atau kode produk..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay"><div className="loading-spinner" /></div>
          ) : produk.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FiPackage /></div>
              <div className="empty-state-text">Belum ada produk</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Harga Beli</th>
                  <th>Harga Jual</th>
                  <th>Stok</th>
                  <th>Status</th>
                  {canEdit && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {produk.map(item => (
                  <tr key={item.id}>
                    <td>
                      <code style={{
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary-light)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                      }}>{item.kode_produk}</code>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {truncate(item.nama, 35)}
                    </td>
                    <td>{item.kategori_nama || '-'}</td>
                    <td>{formatRupiah(item.harga_beli)}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                      {formatRupiah(item.harga_jual)}
                    </td>
                    <td>
                      <span className={
                        item.stok === 0 ? 'stock-low' :
                        item.stok <= item.stok_minimum ? 'stock-warning' : 'stock-ok'
                      }>
                        {item.stok} {item.satuan}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => openEdit(item)}
                            title="Edit"
                          ><FiEdit2 /></button>
                          {isAdmin && (
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              onClick={() => handleDelete(item.id, item.nama)}
                              title="Hapus"
                            ><FiTrash2 /></button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ padding: 16 }}>
            <button
              className="pagination-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`pagination-btn ${page === p ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >›</button>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editData ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button
                className="btn btn-secondary btn-icon btn-sm"
                onClick={() => setShowModal(false)}
              >✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode Produk *</label>
                    <input id="form-kode" className="form-control" required value={form.kode_produk}
                      onChange={e => setForm({ ...form, kode_produk: e.target.value })}
                      placeholder="PRD001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Satuan</label>
                    <select id="form-satuan" className="form-control" value={form.satuan}
                      onChange={e => setForm({ ...form, satuan: e.target.value })}>
                      {['pcs', 'kg', 'gram', 'liter', 'ml', 'botol', 'pak', 'lusin', 'dus'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Produk *</label>
                  <input id="form-nama" className="form-control" required value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })}
                    placeholder="Nama lengkap produk" />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select id="form-kategori" className="form-control" value={form.kategori_id}
                    onChange={e => setForm({ ...form, kategori_id: e.target.value })}>
                    <option value="">-- Pilih Kategori --</option>
                    {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Harga Beli</label>
                    <input id="form-harga-beli" type="number" className="form-control" value={form.harga_beli}
                      onChange={e => setForm({ ...form, harga_beli: e.target.value })}
                      placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Harga Jual *</label>
                    <input id="form-harga-jual" type="number" className="form-control" required value={form.harga_jual}
                      onChange={e => setForm({ ...form, harga_jual: e.target.value })}
                      placeholder="0" min="0" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stok Awal</label>
                    <input id="form-stok" type="number" className="form-control" value={form.stok}
                      onChange={e => setForm({ ...form, stok: e.target.value })}
                      placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stok Minimum</label>
                    <input id="form-stok-min" type="number" className="form-control" value={form.stok_minimum}
                      onChange={e => setForm({ ...form, stok_minimum: e.target.value })}
                      placeholder="5" min="0" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea id="form-deskripsi" className="form-control" rows={3} value={form.deskripsi}
                    onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                    placeholder="Deskripsi produk (opsional)" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button id="btn-simpan-produk" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : (editData ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdukPage;
