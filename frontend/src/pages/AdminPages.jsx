import { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services';
import { responseData } from '../services/api';
import AdminTransactionsPage from './AdminTransactionsPage';

const resourceConfig = {
  products: { title: 'Produk', singular: 'Produk', fields: [['sku', 'Kode produk'], ['name', 'Nama produk'], ['description', 'Deskripsi'], ['category', 'Kategori'], ['unit', 'Satuan'], ['buy_price', 'Harga beli', 'number'], ['sell_price', 'Harga jual', 'number'], ['image_url', 'URL gambar']] },
  dealers: { title: 'Dealer', singular: 'Dealer', fields: [['code', 'Kode dealer'], ['name', 'Nama dealer'], ['email', 'Email', 'email'], ['phone', 'Telepon'], ['address', 'Alamat']] },
  customers: { title: 'Customer', singular: 'Customer', fields: [['name', 'Nama customer'], ['email', 'Email', 'email'], ['phone', 'Telepon'], ['company_name', 'Nama perusahaan'], ['billing_address', 'Alamat tagihan'], ['shipping_address', 'Alamat pengiriman'], ['tax_id', 'NPWP']] },
};
const dataArray = (data) => Array.isArray(data) ? data : data?.items || data?.products || data?.dealers || data?.customers || [];
const idOf = (item) => item?.id ?? item?._id;
const displayName = (item) => item?.name || item?.nama || item?.companyName || item?.email || `Data #${idOf(item)}`;

function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="workspace">
    <header className="workspace-header"><Link to="/admin" className="brand"><span className="brand-mark">D</span>DAMACO <small>ADMIN</small></Link>
      <nav><Link to="/admin/products">Produk</Link><Link to="/admin/dealers">Dealer</Link><Link to="/admin/customers">Customer</Link><Link to="/admin/transactions">Transaksi</Link><Link to="/admin/settings">Pengaturan</Link><span className="user-label">{user?.name || user?.nama || 'Administrator'}</span><button className="link-button" onClick={() => { logout(); navigate('/'); }}>Keluar</button></nav>
    </header>
    <main className="workspace-main admin-main"><Routes>
      <Route index element={<Navigate to="products" replace />} />
      {Object.keys(resourceConfig).map((resource) => <Fragment key={resource}>
        <Route path={resource} element={<ResourcePage resource={resource} />} />
        <Route path={`${resource}/:id`} element={<ResourcePage resource={resource} />} />
      </Fragment>)}
      <Route path="settings" element={<SettingsPage />} />
      <Route path="transactions" element={<AdminTransactionsPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes></main>
  </div>;
}

function ResourcePage({ resource }) {
  const config = resourceConfig[resource];
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const creating = id === 'new' || id === 'baru';
  const editing = Boolean(id) && !creating;

  async function load() {
    setLoading(true);
    try {
      if (editing) setRecord(responseData(await adminService.get(resource, id)) || {});
      else if (creating) setRecord({});
      else setItems(dataArray(responseData(await adminService.list(resource))));
    } catch (error) {
      toast.error(error.response?.data?.message || `Data ${config.title.toLowerCase()} tidak dapat dimuat.`);
    } finally { setLoading(false); }
  }
  useEffect(() => { setRecord(null); load(); }, [resource, id]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(record).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value,
      ]));
      if (editing) await adminService.update(resource, id, payload);
      else await adminService.create(resource, payload);
      toast.success(`${config.singular} berhasil ${editing ? 'diperbarui' : 'ditambahkan'}.`);
      navigate(`/admin/${resource}`);
    } catch (error) { toast.error(error.response?.data?.message || 'Perubahan belum dapat disimpan.'); }
    finally { setSaving(false); }
  }
  async function remove(item) {
    if (!window.confirm(`Hapus ${displayName(item)}?`)) return;
    try {
      await adminService.remove(resource, idOf(item));
      if (editing) navigate(`/admin/${resource}`);
      else setItems((current) => current.filter((entry) => String(idOf(entry)) !== String(idOf(item))));
      toast.success(`${config.singular} dihapus.`);
    } catch (error) { toast.error(error.response?.data?.message || 'Data belum dapat dihapus.'); }
  }

  if (editing || creating) return <section className="panel narrow-panel">
    <Link className="back-link" to={`/admin/${resource}`}>← Kembali ke daftar {config.title.toLowerCase()}</Link>
    <p className="eyebrow">{resource === 'customers' ? 'DETAIL CUSTOMER' : `KELOLA ${config.title.toUpperCase()}`}</p>
    <h1>{loading ? 'Memuat…' : creating ? `Tambah ${config.singular}` : `${config.singular} detail`}</h1>
    {record && <form className="form-stack" onSubmit={save}>
      {config.fields.map(([name, label, type]) => <label key={name}>{label}
        {['description', 'address', 'billing_address', 'shipping_address'].includes(name)
          ? <textarea rows="3" name={name} value={record[name] ?? ''} onChange={(event) => setRecord({ ...record, [name]: event.target.value })} />
          : <input required={['name', 'sku', 'code', 'category', 'unit', 'buy_price', 'sell_price'].includes(name) && creating}
              name={name} type={type || 'text'} value={record[name] ?? ''}
              onChange={(event) => setRecord({ ...record, [name]: type === 'number' ? event.target.value : event.target.value })} />}
      </label>)}
      {resource === 'products' && <label className="check-field"><input type="checkbox" checked={record.is_active !== false && record.is_active !== 0} onChange={(event) => setRecord({ ...record, is_active: event.target.checked })} /> Produk aktif</label>}
      {resource === 'dealers' && <label className="check-field"><input type="checkbox" checked={record.is_active !== false && record.is_active !== 0} onChange={(event) => setRecord({ ...record, is_active: event.target.checked })} /> Dealer aktif</label>}
      {creating && resource === 'customers' && <label>Kata sandi sementara<input required minLength="8" type="password" value={record.password || ''} onChange={(event) => setRecord({ ...record, password: event.target.value })} /></label>}
      <div className="form-actions"><button className="button primary" disabled={saving}>{saving ? 'Menyimpan…' : creating ? `Tambah ${config.singular}` : 'Simpan perubahan'}</button>{editing && <button type="button" className="button danger" onClick={() => remove(record)}>Hapus</button>}</div>
    </form>}
  </section>;

  return <section className="panel">
    <div className="section-heading"><div><p className="eyebrow">PENGELOLAAN DATA</p><h1>{config.title}</h1></div><Link className="button primary" to={`/admin/${resource}/baru`}>+ Tambah {config.singular}</Link></div>
    {loading ? <p className="empty-state">Memuat data…</p> : items.length === 0 ? <p className="empty-state">Belum ada data {config.title.toLowerCase()}.</p> :
      <div className="table-wrap"><table><thead><tr><th>Nama</th><th>Email / kode</th><th>Telepon / harga</th><th>Aksi</th></tr></thead><tbody>{items.map((item) => <tr key={idOf(item)}>
        <td><Link to={`/admin/${resource}/${idOf(item)}`}>{displayName(item)}</Link></td>
        <td>{item.email || item.sku || item.kode_produk || item.code || '—'}</td><td>{item.phone || item.telepon || item.sell_price || item.harga || '—'}</td>
        <td className="table-actions"><Link className="text-action" to={`/admin/${resource}/${idOf(item)}`}>{resource === 'customers' ? 'Detail / edit' : 'Edit'}</Link><button className="text-action danger-text" onClick={() => remove(item)}>Hapus</button></td>
      </tr>)}</tbody></table></div>}
  </section>;
}

function SettingsPage() {
  const [settings, setSettings] = useState({ company_name: '', company_code: '', email: '', phone: '', address: '', tax_id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    adminService.getCompanySettings().then((result) => setSettings({ ...settings, ...(responseData(result) || {}) }))
      .catch(() => toast.error('Pengaturan perusahaan belum dapat dimuat.'))
      .finally(() => setLoading(false));
  }, []);
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await adminService.updateCompanySettings(settings);
      setSettings({ ...settings, ...(responseData(result) || {}) });
      toast.success('Pengaturan perusahaan disimpan.');
    } catch (error) { toast.error(error.response?.data?.message || 'Pengaturan belum dapat disimpan.'); }
    finally { setSaving(false); }
  }
  return <section className="panel narrow-panel"><p className="eyebrow">PENGATURAN</p><h1>Profil perusahaan</h1><p className="muted">Informasi perusahaan yang ditampilkan pada aplikasi.</p>
    {loading ? <p className="empty-state">Memuat pengaturan…</p> : <form className="form-stack" onSubmit={save}>
      {[['company_name', 'Nama perusahaan'], ['company_code', 'Kode perusahaan'], ['email', 'Email', 'email'], ['phone', 'Telepon'], ['tax_id', 'NPWP']].map(([name, label, type]) => <label key={name}>{label}<input required={['company_name', 'company_code'].includes(name)} type={type || 'text'} value={settings[name] || ''} onChange={(event) => setSettings({ ...settings, [name]: event.target.value })} /></label>)}
      <label>Alamat<textarea rows="3" value={settings.address || ''} onChange={(event) => setSettings({ ...settings, address: event.target.value })} /></label>
      <button className="button primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan pengaturan'}</button>
    </form>}
  </section>;
}

export default AdminShell;
