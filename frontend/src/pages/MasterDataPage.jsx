import { useState, useEffect } from 'react';
import { kategoriService, supplierService } from '../services';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ---- Komponen Reusable Tabel Master ----
const MasterTable = ({ title, icon, data, loading, columns, onAdd, onEdit, onDelete }) => (
  <div className="card">
    <div className="card-header">
      <span className="card-title">{icon} {title}</span>
      <button className="btn btn-primary btn-sm" onClick={onAdd}><FiPlus /> Tambah</button>
    </div>
    <div className="table-wrapper">
      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      ) : data.length === 0 ? (
        <div className="empty-state" style={{ padding: 40 }}>
          <div className="empty-state-text">Belum ada data</div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                {columns.map(c => (
                  <td key={c.key} style={c.key === 'nama' ? { color: 'var(--text-primary)', fontWeight: 500 } : {}}>
                    {item[c.key] || '-'}
                  </td>
                ))}
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-icon btn-sm" onClick={() => onEdit(item)} title="Edit"><FiEdit2 /></button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(item)} title="Hapus"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

// ---- Modal Generic ----
const FormModal = ({ show, onClose, onSubmit, title, fields, form, setForm, submitting }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {fields.map(field => (
              <div key={field.key} className="form-group">
                <label className="form-label">{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea className="form-control" rows={3} value={form[field.key] || ''}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder} required={field.required} />
                ) : (
                  <input type={field.type || 'text'} className="form-control" value={form[field.key] || ''}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder} required={field.required} />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Halaman Utama ----
const MasterDataPage = () => {
  const [kategori, setKategori] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [loadingK, setLoadingK] = useState(true);
  const [loadingS, setLoadingS] = useState(true);

  const [modalState, setModalState] = useState({ show: false, type: '', edit: null });
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoadingK(true); setLoadingS(true);
    kategoriService.getAll().then(r => { setKategori(r.data.data); setLoadingK(false); });
    supplierService.getAll().then(r => { setSupplier(r.data.data); setLoadingS(false); });
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = (type, edit = null) => {
    if (type === 'kategori') {
      setForm(edit ? { nama: edit.nama, deskripsi: edit.deskripsi || '' } : { nama: '', deskripsi: '' });
    } else {
      setForm(edit ? { nama: edit.nama, email: edit.email || '', telepon: edit.telepon || '', alamat: edit.alamat || '' }
        : { nama: '', email: '', telepon: '', alamat: '' });
    }
    setModalState({ show: true, type, edit });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { type, edit } = modalState;
    const svc = type === 'kategori' ? kategoriService : supplierService;
    try {
      if (edit) { await svc.update(edit.id, form); toast.success('Data berhasil diupdate'); }
      else { await svc.create(form); toast.success('Data berhasil ditambahkan'); }
      setModalState({ show: false, type: '', edit: null });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (type, item) => {
    if (!confirm(`Hapus "${item.nama}"?`)) return;
    const svc = type === 'kategori' ? kategoriService : supplierService;
    try {
      await svc.delete(item.id);
      toast.success('Data berhasil dihapus');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <MasterTable
        title="Kategori Produk" icon="🏷️"
        data={kategori} loading={loadingK}
        columns={[{ key: 'nama', label: 'Nama' }, { key: 'deskripsi', label: 'Deskripsi' }]}
        onAdd={() => openModal('kategori')}
        onEdit={(item) => openModal('kategori', item)}
        onDelete={(item) => handleDelete('kategori', item)}
      />

      <MasterTable
        title="Supplier" icon="🚚"
        data={supplier} loading={loadingS}
        columns={[
          { key: 'nama', label: 'Nama' },
          { key: 'telepon', label: 'Telepon' },
          { key: 'email', label: 'Email' },
        ]}
        onAdd={() => openModal('supplier')}
        onEdit={(item) => openModal('supplier', item)}
        onDelete={(item) => handleDelete('supplier', item)}
      />

      <FormModal
        show={modalState.show}
        onClose={() => setModalState({ show: false, type: '', edit: null })}
        onSubmit={handleSubmit}
        title={`${modalState.edit ? 'Edit' : 'Tambah'} ${modalState.type === 'kategori' ? 'Kategori' : 'Supplier'}`}
        form={form}
        setForm={setForm}
        submitting={submitting}
        fields={modalState.type === 'kategori'
          ? [{ key: 'nama', label: 'Nama', required: true, placeholder: 'Nama kategori' },
             { key: 'deskripsi', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi' }]
          : [{ key: 'nama', label: 'Nama', required: true, placeholder: 'Nama supplier' },
             { key: 'email', label: 'Email', type: 'email', placeholder: 'email@supplier.com' },
             { key: 'telepon', label: 'Telepon', placeholder: '021-xxxxxxx' },
             { key: 'alamat', label: 'Alamat', type: 'textarea', placeholder: 'Alamat lengkap' }]
        }
      />
    </div>
  );
};

export default MasterDataPage;
