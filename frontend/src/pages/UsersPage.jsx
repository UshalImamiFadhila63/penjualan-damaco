import { useState, useEffect } from 'react';
import { userService } from '../services';
import { getRoleBadge } from '../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const INIT_FORM = { nama: '', email: '', password: '', role: 'kasir', is_active: 1 };

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setData(res.data.data);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditData(null); setForm(INIT_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditData(item);
    setForm({ nama: item.nama, email: item.email, password: '', role: item.role, is_active: item.is_active });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editData && !payload.password) delete payload.password;
      if (editData) { await userService.update(editData.id, payload); toast.success('User berhasil diupdate'); }
      else { await userService.create(payload); toast.success('User berhasil ditambahkan'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, nama) => {
    if (id === currentUser.id) { toast.error('Tidak bisa menghapus akun sendiri!'); return; }
    if (!confirm(`Hapus user "${nama}"?`)) return;
    try {
      await userService.delete(id);
      toast.success('User berhasil dihapus');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen User</h1>
          <p className="page-subtitle">{data.length} user terdaftar</p>
        </div>
        <button id="btn-tambah-user" className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Tambah User
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay"><div className="loading-spinner" /></div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {data.map(item => {
                  const roleBadge = getRoleBadge(item.role);
                  const isSelf = item.id === currentUser.id;
                  return (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.nama} {isSelf && <span className="badge badge-info" style={{ marginLeft: 8, fontSize: 10 }}>Anda</span>}
                      </td>
                      <td>{item.email}</td>
                      <td>
                        <span className={`badge badge-${roleBadge.color}`}>{roleBadge.label}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(item)} title="Edit"><FiEdit2 /></button>
                          {!isSelf && (
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(item.id, item.nama)} title="Hapus"><FiTrash2 /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editData ? 'Edit User' : 'Tambah User Baru'}</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input id="form-nama-user" className="form-control" required value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password {editData ? '(kosongkan jika tidak diubah)' : '*'}</label>
                  <input type="password" className="form-control" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" required={!editData} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select className="form-control" value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="kasir">Kasir</option>
                      <option value="gudang">Gudang</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.is_active}
                      onChange={e => setForm({ ...form, is_active: parseInt(e.target.value) })}>
                      <option value={1}>Aktif</option>
                      <option value={0}>Nonaktif</option>
                    </select>
                  </div>
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

export default UsersPage;
