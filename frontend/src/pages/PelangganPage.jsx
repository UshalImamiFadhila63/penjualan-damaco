import { useState, useEffect } from 'react';
import { pelangganService } from '../services';
import { formatTanggal } from '../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const INIT_FORM = { nama: '', email: '', telepon: '', alamat: '' };

const PelangganPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await pelangganService.getAll({ search });
      // Exclude "Umum" (id=1) dari tampilan
      setData(res.data.data.filter(p => p.id !== 1));
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openAdd = () => { setEditData(null); setForm(INIT_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditData(item);
    setForm({ nama: item.nama, email: item.email || '', telepon: item.telepon || '', alamat: item.alamat || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await pelangganService.update(editData.id, form);
        toast.success('Pelanggan berhasil diupdate');
      } else {
        await pelangganService.create(form);
        toast.success('Pelanggan berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus pelanggan "${nama}"?`)) return;
    try {
      await pelangganService.delete(id);
      toast.success('Pelanggan berhasil dihapus');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pelanggan</h1>
          <p className="page-subtitle">{data.length} pelanggan terdaftar</p>
        </div>
        <button id="btn-tambah-pelanggan" className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Tambah Pelanggan
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <FiSearch className="search-input-icon" />
          <input id="search-pelanggan" type="text" className="search-input"
            placeholder="Cari nama atau nomor telepon..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay"><div className="loading-spinner" /></div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FiUsers /></div>
              <div className="empty-state-text">Belum ada pelanggan</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Alamat</th><th>Terdaftar</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.nama}</td>
                    <td>{item.email || '-'}</td>
                    <td>{item.telepon || '-'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.alamat || '-'}
                    </td>
                    <td style={{ fontSize: 12 }}>{formatTanggal(item.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(item)} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(item.id, item.nama)} title="Hapus"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editData ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama *</label>
                  <input id="form-nama-pelanggan" className="form-control" required value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama pelanggan" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telepon</label>
                    <input className="form-control" value={form.telepon}
                      onChange={e => setForm({ ...form, telepon: e.target.value })} placeholder="08xxxxxxxxxx" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <textarea className="form-control" rows={3} value={form.alamat}
                    onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
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

export default PelangganPage;
