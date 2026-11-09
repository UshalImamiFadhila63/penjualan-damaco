import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiX } from 'react-icons/fi';
import { authService, penawaranService, publicService } from '../services';
import { formatRupiah } from '../utils/helpers';

const PublicHomePage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [quoteItems, setQuoteItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState('register');
  const [registration, setRegistration] = useState({ nama: '', email: '', telepon: '', password: '' });
  const [registrationToken, setRegistrationToken] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');

  useEffect(() => {
    publicService.getCatalog()
      .then((response) => setProducts(response.data.data))
      .catch(() => toast.error('Katalog belum dapat dimuat. Silakan coba lagi.'));
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return products;
    return products.filter((product) =>
      `${product.nama} ${product.kode_produk} ${product.kategori_nama || ''}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [products, search]);

  const addProduct = (product) => {
    setQuoteItems((items) => {
      const existing = items.find((item) => item.produk_id === product.id);
      if (existing) {
        return items.map((item) =>
          item.produk_id === product.id ? { ...item, jumlah: item.jumlah + 1 } : item
        );
      }
      return [...items, { produk_id: product.id, nama: product.nama, jumlah: 1 }];
    });
    toast.success(`${product.nama} ditambahkan ke penawaran`);
  };

  const updateQuantity = (productId, change) => {
    setQuoteItems((items) => items
      .map((item) => item.produk_id === productId
        ? { ...item, jumlah: item.jumlah + change }
        : item)
      .filter((item) => item.jumlah > 0));
  };

  const openOffer = () => {
    if (quoteItems.length === 0) {
      toast.error('Pilih produk yang ingin ditanyakan terlebih dahulu');
      return;
    }
    setStep(registrationToken ? 'request' : 'register');
    setShowModal(true);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await authService.registerCustomer(registration);
      setRegistrationToken(response.data.data.token);
      setStep('request');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOffer = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await penawaranService.create({
        items: quoteItems.map(({ produk_id, jumlah }) => ({ produk_id, jumlah })),
        catatan: note,
      }, registrationToken);
      setReference(response.data.data.nomor_penawaran);
      setStep('success');
      setRegistrationToken('');
      setQuoteItems([]);
      setNote('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Permintaan penawaran gagal dikirim');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (step === 'success') {
      setRegistrationToken('');
      setStep('register');
    }
  };

  return (
    <div className="storefront">
      <header className="storefront-header">
        <a className="storefront-brand" href="/">
          <span className="storefront-brand-icon"><FiShoppingBag /></span>
          <span>Damaco <small>Penawaran Produk</small></span>
        </a>
      </header>

      <main>
        <section className="storefront-hero">
          <div className="storefront-hero-copy">
            <span className="storefront-eyebrow">KATALOG PRODUK DAMACO</span>
            <h1>Temukan produk yang Anda butuhkan.</h1>
            <p>Lihat katalog kami tanpa perlu masuk. Pilih produk, ajukan penawaran, dan tim kami akan menindaklanjutinya.</p>
            <a href="#katalog" className="btn btn-primary btn-lg">Lihat Katalog <FiArrowRight /></a>
          </div>
          <div className="storefront-hero-art" aria-hidden="true">🛍️</div>
        </section>

        <section id="katalog" className="storefront-catalog">
          <div className="storefront-section-heading">
            <div>
              <span className="storefront-eyebrow">PILIH PRODUK</span>
              <h2>Katalog Produk</h2>
            </div>
            <input
              className="form-control storefront-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau kategori produk..."
              aria-label="Cari produk"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="storefront-empty">{products.length ? 'Produk tidak ditemukan.' : 'Belum ada produk yang tersedia.'}</div>
          ) : (
            <div className="storefront-grid">
              {filteredProducts.map((product) => {
                const selected = quoteItems.find((item) => item.produk_id === product.id);
                return (
                  <article className="storefront-product" key={product.id}>
                    <div className="storefront-product-icon">📦</div>
                    <span className="storefront-category">{product.kategori_nama || 'Produk'}</span>
                    <h3>{product.nama}</h3>
                    <p>{product.deskripsi || `Satuan: ${product.satuan || 'pcs'}`}</p>
                    <strong>{formatRupiah(product.harga_jual)} <small>/ {product.satuan || 'pcs'}</small></strong>
                    {selected ? (
                      <div className="storefront-quantity">
                        <button type="button" aria-label={`Kurangi ${product.nama}`} onClick={() => updateQuantity(product.id, -1)}><FiMinus /></button>
                        <span>{selected.jumlah} dipilih</span>
                        <button type="button" aria-label={`Tambah ${product.nama}`} onClick={() => updateQuantity(product.id, 1)}><FiPlus /></button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary" onClick={() => addProduct(product)}>
                        <FiPlus /> Pilih Produk
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {quoteItems.length > 0 && (
        <div className="storefront-quote-bar">
          <span>{quoteItems.reduce((total, item) => total + item.jumlah, 0)} produk dipilih</span>
          <button type="button" className="btn btn-primary" onClick={openOffer}>Ajukan Penawaran <FiArrowRight /></button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="modal storefront-modal">
            <div className="modal-header">
              <div>
                <span className="storefront-eyebrow">
                  {step === 'register' ? 'LANGKAH 1 DARI 2' : step === 'request' ? 'LANGKAH 2 DARI 2' : 'SELESAI'}
                </span>
                <h2 className="modal-title">
                  {step === 'register' ? 'Buat akun customer' : step === 'request' ? 'Kirim permintaan penawaran' : 'Permintaan terkirim'}
                </h2>
              </div>
              <button type="button" className="btn btn-secondary btn-icon btn-sm" onClick={closeModal} aria-label="Tutup"><FiX /></button>
            </div>

            {step === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="modal-body">
                  <p className="storefront-modal-copy">Akun dibuat setelah Anda memilih produk agar kami dapat menghubungi Anda mengenai penawaran.</p>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-name">Nama lengkap *</label>
                    <input id="customer-name" className="form-control" autoComplete="name" required value={registration.nama}
                      onChange={(event) => setRegistration({ ...registration, nama: event.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-email">Email *</label>
                    <input id="customer-email" type="email" className="form-control" autoComplete="email" required value={registration.email}
                      onChange={(event) => setRegistration({ ...registration, email: event.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-phone">Nomor telepon</label>
                    <input id="customer-phone" type="tel" className="form-control" autoComplete="tel" value={registration.telepon}
                      onChange={(event) => setRegistration({ ...registration, telepon: event.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-password">Password * (minimal 8 karakter)</label>
                    <input id="customer-password" type="password" className="form-control" autoComplete="new-password" minLength={8} required value={registration.password}
                      onChange={(event) => setRegistration({ ...registration, password: event.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Membuat akun...' : 'Lanjutkan'}</button>
                </div>
              </form>
            )}

            {step === 'request' && (
              <form onSubmit={handleSubmitOffer}>
                <div className="modal-body">
                  <p className="storefront-modal-copy">Periksa pilihan produk dan jumlahnya sebelum mengirim permintaan.</p>
                  <div className="storefront-selected-list">
                    {quoteItems.map((item) => (
                      <div className="storefront-selected-item" key={item.produk_id}>
                        <span>{item.nama}</span>
                        <div className="storefront-quantity">
                          <button type="button" aria-label={`Kurangi ${item.nama}`} onClick={() => updateQuantity(item.produk_id, -1)}><FiMinus /></button>
                          <span>{item.jumlah}</span>
                          <button type="button" aria-label={`Tambah ${item.nama}`} onClick={() => updateQuantity(item.produk_id, 1)}><FiPlus /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="offer-note">Catatan untuk tim kami</label>
                    <textarea id="offer-note" className="form-control" rows={3} maxLength={1000} value={note}
                      onChange={(event) => setNote(event.target.value)} placeholder="Contoh: kebutuhan dan waktu pengiriman" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep('register')}>Kembali</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || quoteItems.length === 0}>{submitting ? 'Mengirim...' : 'Kirim Penawaran'}</button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="modal-body storefront-success">
                <div className="storefront-success-icon">✓</div>
                <p>Permintaan Anda sudah diterima. Tim Damaco akan menindaklanjuti melalui kontak yang Anda daftarkan.</p>
                <strong>Nomor penawaran: {reference}</strong>
                <button type="button" className="btn btn-primary" onClick={closeModal}>Kembali ke katalog</button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="storefront-footer">Damaco · Katalog dan permintaan penawaran</footer>
    </div>
  );
};

export default PublicHomePage;
