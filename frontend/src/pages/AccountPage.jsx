import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services';
import { responseData } from '../services/api';

const CART_KEY = 'damaco-cart';
const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(user || {});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    customerService.getProfile()
      .then((result) => setProfile({ ...user, ...(responseData(result) || {}) }))
      .catch((error) => toast.error(error.response?.data?.message || 'Profil belum dapat dimuat.'));
  }, []);
  const change = (event) => setProfile({ ...profile, [event.target.name]: event.target.value });
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await customerService.updateProfile(profile);
      const updated = { ...profile, ...(responseData(result) || {}) };
      setProfile(updated);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profil berhasil diperbarui.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profil belum dapat disimpan.');
    } finally { setSaving(false); }
  }
  return <section className="panel narrow-panel"><p className="eyebrow">PROFIL SAYA</p><h1>Informasi akun</h1><p className="muted">Perbarui detail kontak Anda.</p>
    <form className="form-stack" onSubmit={save}>
      <label>Nama<input required name="name" value={profile.name || profile.nama || ''} onChange={(event) => {
        const value = event.target.value;
        setProfile({ ...profile, name: value, ...(profile.nama !== undefined ? { nama: value } : {}) });
      }} /></label>
      <label>Email<input required type="email" name="email" value={profile.email || ''} onChange={change} /></label>
      <label>Telepon<input name="phone" value={profile.phone || profile.telepon || ''} onChange={(event) => {
        const value = event.target.value;
        setProfile({ ...profile, phone: value, ...(profile.telepon !== undefined ? { telepon: value } : {}) });
      }} /></label>
      <label>Alamat tagihan<textarea name="billing_address" value={profile.billing_address || ''} onChange={(event) => {
        const value = event.target.value;
        setProfile({ ...profile, billing_address: value });
      }} rows="3" /></label>
      <button className="button primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan perubahan'}</button>
    </form>
  </section>;
}

function AccountHome() {
  const { user } = useAuth();
  const [cart, setCart] = useState(readCart);
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadDocuments() {
    try {
      const [requestResponse, offerResponse] = await Promise.all([
        customerService.getQuotationRequests(),
        customerService.getOffers(),
      ]);
      setRequests(responseData(requestResponse) || []);
      setOffers(responseData(offerResponse) || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Riwayat penawaran belum dapat dimuat.');
    } finally {
      setLoadingDocuments(false);
    }
  }

  useEffect(() => { loadDocuments(); }, []);

  async function submitRequest() {
    if (!cart.length) {
      toast('Pilih produk dari katalog terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    try {
      const result = responseData(await customerService.createQuotationRequest({
        items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      }));
      localStorage.removeItem(CART_KEY);
      setCart([]);
      toast.success(`Permintaan ${result?.request_number || ''} berhasil dikirim.`);
      await loadDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Permintaan penawaran belum dapat dikirim.');
    } finally {
      setSubmitting(false);
    }
  }

  async function respondToOffer(offer, status) {
    try {
      await customerService.respondToOffer(offer.id, status);
      toast.success(status === 'ACCEPTED' ? 'Penawaran diterima.' : 'Penawaran ditolak.');
      await loadDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Respons penawaran belum dapat disimpan.');
    }
  }

  return <div className="account-content">
    <section className="account-welcome"><div><p className="eyebrow">AKUN CUSTOMER</p><h1>Halo, {user?.name || user?.nama || 'Customer'}.</h1><p className="muted">Keranjang Anda tersimpan di perangkat ini.</p></div><Link className="button primary" to="/akun/profil">Edit profil</Link></section>
    <section className="panel"><div className="section-heading"><div><p className="eyebrow">KERANJANG</p><h2>Produk yang Anda pilih</h2></div><Link to="/" className="back-link">Lanjutkan melihat katalog →</Link></div>
      {cart.length ? <div className="cart-list">{cart.map((item) => <div className="cart-row" key={item.id}><span>{item.name}</span><strong>{item.quantity} item</strong></div>)}</div> : <p className="empty-state">Keranjang masih kosong. Jelajahi katalog untuk memilih produk.</p>}
      <div className="notice"><strong>Informasi penawaran</strong><p>Permintaan dikirim kepada tim DAMACO untuk ditindaklanjuti. Harga yang tercantum pada katalog bukan penawaran final.</p></div>
      <button className="button primary" disabled={submitting || !cart.length} onClick={submitRequest}>{submitting ? 'Mengirim…' : 'Kirim permintaan penawaran'}</button>
    </section>
    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">RIWAYAT</p><h2>Permintaan penawaran</h2></div></div>
      {loadingDocuments ? <p className="empty-state">Memuat riwayat…</p> : requests.length === 0
        ? <p className="empty-state">Belum ada permintaan penawaran.</p>
        : <div className="cart-list">{requests.map((request) => <article className="cart-row" key={request.id}>
          <div><strong>{request.request_number}</strong><p className="muted">{request.status} · {new Date(request.created_at).toLocaleDateString('id-ID')}</p>
            {request.items?.map((item) => <div key={`${request.id}-${item.product_id}`}>{item.product_name} × {item.quantity}</div>)}
          </div>
        </article>)}</div>}
    </section>
    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">PENAWARAN DARI DAMACO</p><h2>Penawaran Anda</h2></div></div>
      {loadingDocuments ? <p className="empty-state">Memuat penawaran…</p> : offers.length === 0
        ? <p className="empty-state">Belum ada penawaran untuk akun Anda.</p>
        : <div className="cart-list">{offers.map((offer) => <article className="cart-row" key={offer.id}>
          <div><strong>{offer.offer_number}</strong><p className="muted">{offer.status}{offer.valid_until ? ` · berlaku sampai ${new Date(offer.valid_until).toLocaleDateString('id-ID')}` : ''}</p>
            {offer.items?.map((item) => <div key={`${offer.id}-${item.product_id}`}>{item.product_name} × {item.quantity} · {Number(item.unit_price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</div>)}
            {offer.notes && <p>{offer.notes}</p>}
            {offer.status === 'SENT' && <div className="form-actions">
              <button className="button primary" onClick={() => respondToOffer(offer, 'ACCEPTED')}>Terima</button>
              <button className="button light" onClick={() => respondToOffer(offer, 'REJECTED')}>Tolak</button>
            </div>}
          </div>
        </article>)}</div>}
    </section>
  </div>;
}

export default function AccountPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  return <div className="workspace">
    <header className="workspace-header"><Link className="brand" to="/"><span className="brand-mark">D</span>DAMACO</Link><nav><Link to="/akun">Ringkasan</Link><Link to="/akun/profil">Profil</Link><button className="link-button" onClick={() => { logout(); navigate('/'); }}>Keluar</button></nav></header>
    <main className="workspace-main"><Routes><Route index element={<AccountHome />} /><Route path="profil" element={<ProfilePage />} /><Route path="*" element={<Navigate to="/akun" replace />} /></Routes></main>
  </div>;
}
