import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { customerService, publicService } from '../services';
import { responseData } from '../services/api';

const CART_KEY = 'damaco-cart';
const getCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};
const listFrom = (payload) => Array.isArray(payload) ? payload : payload?.products || payload?.items || [];
const price = (value) => Number(value || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const productName = (product) => product?.name || product?.nama || product?.nama_produk || 'Produk';
const productId = (product) => product?.id ?? product?._id;

export default function StorefrontPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(getCart);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    publicService.getProducts()
      .then((response) => setProducts(listFrom(responseData(response))))
      .catch(() => toast.error('Katalog produk belum dapat dimuat.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    if (!id) { setSelected(null); return; }
    const found = products.find((product) => String(productId(product)) === id);
    if (found) setSelected(found);
    else if (!loading) publicService.getProduct(id)
      .then((response) => setSelected(responseData(response)))
      .catch(() => setSelected(null));
  }, [id, products, loading]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products.filter((product) => `${productName(product)} ${product.description || product.deskripsi || product.category || product.kategori_nama || ''}`.toLowerCase().includes(query));
  }, [products, search]);

  function saveCart(next) { setCart(next); }
  function add(product) {
    const key = String(productId(product));
    const exists = cart.find((item) => String(item.id) === key);
    saveCart(exists
      ? cart.map((item) => String(item.id) === key ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { id: productId(product), name: productName(product), quantity: 1 }]);
    toast.success('Produk ditambahkan ke keranjang.');
  }
  function quantity(idValue, delta) {
    saveCart(cart.map((item) => String(item.id) === String(idValue) ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }
  async function requestQuote() {
    if (!cart.length) { toast('Pilih produk terlebih dahulu.'); return; }
    if (!user) {
      navigate('/masuk?aksi=penawaran', { state: { from: '/akun' } });
      return;
    }
    if (String(user.role).toUpperCase() !== 'CUSTOMER') {
      toast.error('Hanya akun customer yang dapat mengajukan penawaran.');
      return;
    }
    try {
      const response = await customerService.createQuotationRequest({
        items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });
      const request = responseData(response);
      setCart([]);
      localStorage.removeItem(CART_KEY);
      toast.success(`Permintaan ${request?.request_number || ''} berhasil dikirim.`);
      navigate('/akun');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Permintaan penawaran belum dapat dikirim.');
    }
  }
  const activeProduct = id ? selected : null;

  return (
    <div className="storefront-page">
      <header className="site-header">
        <Link to="/" className="brand"><span className="brand-mark">D</span><span>DAMACO<small>Perlengkapan pilihan</small></span></Link>
        <nav className="header-actions">
          <a href="#katalog">Katalog</a>
          <span className="cart-count"><FiShoppingBag /> {cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          {!user ? <Link className="button light" to="/masuk">Masuk</Link> : String(user.role).toUpperCase() === 'CUSTOMER' ? <Link className="button light" to="/akun">Akun</Link> : null}
        </nav>
      </header>

      {!id && <section className="hero">
        <div><p className="eyebrow">KATALOG DAMACO</p><h1>Produk pilihan,<br />untuk kebutuhan Anda.</h1><p>Jelajahi katalog dan simpan produk yang Anda minati di keranjang.</p><a className="button primary" href="#katalog">Jelajahi katalog <FiArrowRight /></a></div>
        <div className="hero-art" aria-hidden="true"><FiShoppingBag /></div>
      </section>}

      <main className="catalog" id="katalog">
        {activeProduct ? <section className="detail-card">
          <button className="back-link button-reset" onClick={() => navigate(-1)}><FiArrowLeft /> Kembali ke katalog</button>
          {!selected ? <p className="muted">{loading ? 'Memuat produk…' : 'Produk tidak ditemukan.'}</p> : <>
            <div className="detail-art"><FiShoppingBag /></div>
            <div><p className="eyebrow">{selected.category || selected.kategori_nama || 'PRODUK'}</p><h1>{productName(selected)}</h1>
              <p className="muted">{selected.description || selected.deskripsi || 'Informasi produk tersedia melalui tim kami.'}</p>
              <strong className="product-price">{price(selected.sell_price ?? selected.price ?? selected.harga ?? selected.harga_jual)}</strong>
              <div className="detail-actions"><button className="button primary" onClick={() => add(selected)}><FiPlus /> Tambah ke keranjang</button><button className="button light" onClick={requestQuote}>Minta penawaran</button></div>
            </div>
          </>}
        </section> : <>
          <div className="section-heading"><div><p className="eyebrow">TEMUKAN KEBUTUHAN ANDA</p><h2>Produk katalog</h2></div><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari produk…" /></div>
          {loading ? <p className="empty-state">Memuat katalog…</p> : filtered.length === 0 ? <p className="empty-state">{products.length ? 'Tidak ada produk yang cocok.' : 'Belum ada produk yang tersedia.'}</p> :
            <div className="product-grid">{filtered.map((product) => {
              const cartItem = cart.find((item) => String(item.id) === String(productId(product)));
              return <article className="product-card" key={productId(product)}>
                <Link to={`/produk/${productId(product)}`} className="product-art"><FiShoppingBag /></Link>
                <p className="eyebrow">{product.category || product.kategori_nama || 'PRODUK'}</p>
                <Link className="product-title" to={`/produk/${productId(product)}`}>{productName(product)}</Link>
                <p className="muted product-description">{product.description || product.deskripsi || `Satuan: ${product.unit || product.satuan || 'unit'}`}</p>
                <strong className="product-price">{price(product.sell_price ?? product.price ?? product.harga ?? product.harga_jual)}</strong>
                {cartItem ? <div className="quantity-control"><button aria-label="Kurangi jumlah" onClick={() => quantity(cartItem.id, -1)}><FiMinus /></button><span>{cartItem.quantity}</span><button aria-label="Tambah jumlah" onClick={() => quantity(cartItem.id, 1)}><FiPlus /></button></div> :
                  <button className="button light full" onClick={() => add(product)}>Tambah ke keranjang <FiPlus /></button>}
              </article>;
            })}</div>}
        </>}
      </main>

      {cart.length > 0 && <div className="cart-bar"><span><strong>{cart.reduce((sum, item) => sum + item.quantity, 0)} item</strong> disimpan di keranjang</span><button className="button primary" onClick={requestQuote}>Minta penawaran <FiArrowRight /></button></div>}
      <footer className="site-footer">© {new Date().getFullYear()} Damaco. Informasi produk dapat berubah.</footer>
    </div>
  );
}
