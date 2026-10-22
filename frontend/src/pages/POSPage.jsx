import { useState, useEffect } from 'react';
import { produkService, penjualanService, pelangganService } from '../services';
import { formatRupiah } from '../utils/helpers';
import { FiSearch, FiTrash2, FiShoppingCart, FiUser, FiPlus, FiMinus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const POSPage = () => {
  const [produkList, setProdukList] = useState([]);
  const [pelangganList, setPelangganList] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchProduk, setSearchProduk] = useState('');
  const [selectedPelanggan, setSelectedPelanggan] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState('tunai');
  const [uangBayar, setUangBayar] = useState('');
  const [diskon, setDiskon] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);

  useEffect(() => {
    produkService.getAll({ limit: 100, is_active: 1 }).then(res => setProdukList(res.data.data));
    pelangganService.getAll().then(res => setPelangganList(res.data.data));
  }, []);

  const filteredProduk = produkList.filter(p =>
    p.nama.toLowerCase().includes(searchProduk.toLowerCase()) ||
    p.kode_produk.toLowerCase().includes(searchProduk.toLowerCase())
  );

  const addToCart = (produk) => {
    if (produk.stok === 0) { toast.error('Stok habis!'); return; }
    setCart(prev => {
      const existing = prev.find(c => c.id === produk.id);
      if (existing) {
        if (existing.jumlah >= produk.stok) { toast.error('Stok tidak cukup!'); return prev; }
        return prev.map(c => c.id === produk.id ? { ...c, jumlah: c.jumlah + 1 } : c);
      }
      return [...prev, { ...produk, jumlah: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(c => c.id === id ? { ...c, jumlah: Math.max(1, c.jumlah + delta) } : c)
      .filter(c => c.jumlah > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const totalHarga = cart.reduce((sum, c) => sum + c.harga_jual * c.jumlah, 0);
  const totalBayar = totalHarga - diskon;
  const kembalian = (parseFloat(uangBayar) || 0) - totalBayar;

  const handleBayar = async () => {
    if (cart.length === 0) { toast.error('Keranjang kosong!'); return; }
    if (metodePembayaran === 'tunai' && (!uangBayar || parseFloat(uangBayar) < totalBayar)) {
      toast.error('Uang bayar kurang!'); return;
    }
    setLoading(true);
    try {
      const res = await penjualanService.create({
        pelanggan_id: selectedPelanggan || null,
        items: cart.map(c => ({ produk_id: c.id, jumlah: c.jumlah })),
        diskon,
        uang_bayar: parseFloat(uangBayar) || totalBayar,
        metode_pembayaran: metodePembayaran,
      });
      setShowReceipt(res.data.data);
      setCart([]);
      setUangBayar('');
      setDiskon(0);
      setSelectedPelanggan('');
      toast.success(`Transaksi ${res.data.data.nomor_transaksi} berhasil! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaksi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-layout">
      {/* Produk Panel */}
      <div className="pos-products">
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <FiSearch className="search-input-icon" />
            <input
              id="search-produk-pos"
              type="text"
              className="search-input"
              placeholder="Cari produk atau scan barcode..."
              value={searchProduk}
              onChange={e => setSearchProduk(e.target.value)}
            />
          </div>
        </div>

        <div className="products-grid">
          {filteredProduk.map(produk => (
            <div
              key={produk.id}
              className="product-card"
              onClick={() => addToCart(produk)}
              style={{ opacity: produk.stok === 0 ? 0.5 : 1 }}
            >
              <div style={{
                width: 50, height: 50, margin: '0 auto 10px',
                background: 'var(--primary-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>📦</div>
              <div className="product-card-name">{produk.nama}</div>
              <div className="product-card-price">{formatRupiah(produk.harga_jual)}</div>
              <div className="product-card-stock">
                Stok: <span className={produk.stok === 0 ? 'stock-low' : ''}>
                  {produk.stok} {produk.satuan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiShoppingCart /> Keranjang
            {cart.length > 0 && (
              <span className="badge badge-purple" style={{ marginLeft: 4 }}>
                {cart.reduce((s, c) => s + c.jumlah, 0)}
              </span>
            )}
          </div>
        </div>

        {/* Pelanggan */}
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FiUser style={{ color: 'var(--text-muted)' }} />
            <select
              id="select-pelanggan"
              className="form-control"
              style={{ flex: 1 }}
              value={selectedPelanggan}
              onChange={e => setSelectedPelanggan(e.target.value)}
            >
              {pelangganList.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon" style={{ fontSize: 36 }}>🛒</div>
              <div className="empty-state-text" style={{ fontSize: 13 }}>
                Klik produk untuk menambahkan
              </div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pos-cart-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.nama}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--primary-light)' }}>
                    {formatRupiah(item.harga_jual)}
                  </div>
                </div>
                <div className="pos-qty-control">
                  <button className="pos-qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                    {item.jumlah}
                  </span>
                  <button className="pos-qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginLeft: 8, minWidth: 70, textAlign: 'right' }}>
                  {formatRupiah(item.harga_jual * item.jumlah)}
                </div>
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  style={{ marginLeft: 6, flexShrink: 0 }}
                  onClick={() => removeFromCart(item.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary & Payment */}
        <div className="pos-cart-footer">
          <div className="pos-summary-row">
            <span>Subtotal</span>
            <span>{formatRupiah(totalHarga)}</span>
          </div>

          <div className="pos-summary-row" style={{ alignItems: 'center' }}>
            <span>Diskon</span>
            <input
              id="input-diskon"
              type="number"
              style={{
                width: 100, textAlign: 'right', background: 'var(--bg-input)',
                border: '1px solid var(--border)', borderRadius: 4,
                padding: '3px 8px', color: 'var(--text-primary)', fontSize: 13,
              }}
              value={diskon}
              onChange={e => setDiskon(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div className="pos-summary-row total">
            <span>Total Bayar</span>
            <span style={{ color: 'var(--primary-light)' }}>{formatRupiah(totalBayar)}</span>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Metode Pembayaran</label>
            <select
              id="select-metode"
              className="form-control"
              value={metodePembayaran}
              onChange={e => setMetodePembayaran(e.target.value)}
            >
              <option value="tunai">💵 Tunai</option>
              <option value="transfer">🏦 Transfer</option>
              <option value="kartu">💳 Kartu</option>
              <option value="qris">📱 QRIS</option>
            </select>
          </div>

          {metodePembayaran === 'tunai' && (
            <>
              <div className="form-group">
                <label className="form-label">Uang Bayar</label>
                <input
                  id="input-uang-bayar"
                  type="number"
                  className="form-control"
                  value={uangBayar}
                  onChange={e => setUangBayar(e.target.value)}
                  placeholder={formatRupiah(totalBayar)}
                  min={totalBayar}
                />
              </div>
              {uangBayar && (
                <div className="pos-summary-row" style={{ color: kembalian >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  <span>Kembalian</span>
                  <strong>{formatRupiah(Math.max(0, kembalian))}</strong>
                </div>
              )}
            </>
          )}

          <button
            id="btn-bayar"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            onClick={handleBayar}
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Memproses...' : '✓ Proses Pembayaran'}
          </button>

          {cart.length > 0 && (
            <button
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={() => setCart([])}
            >
              🗑 Kosongkan Keranjang
            </button>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header" style={{ justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 40 }}>🎉</div>
              <h3 className="modal-title">Transaksi Berhasil!</h3>
              <p style={{ color: 'var(--primary-light)', fontSize: 14, fontWeight: 600 }}>
                {showReceipt.nomor_transaksi}
              </p>
            </div>
            <div className="modal-body">
              {showReceipt.items?.map(item => (
                <div key={item.id} className="pos-summary-row" style={{ marginBottom: 8 }}>
                  <span>{item.nama_produk} × {item.jumlah}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
              <hr style={{ border: '1px solid var(--border)', margin: '12px 0' }} />
              <div className="pos-summary-row total">
                <span>Total Dibayar</span>
                <span style={{ color: 'var(--success)' }}>{formatRupiah(showReceipt.total_bayar)}</span>
              </div>
              {showReceipt.kembalian > 0 && (
                <div className="pos-summary-row">
                  <span>Kembalian</span>
                  <span>{formatRupiah(showReceipt.kembalian)}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                id="btn-tutup-struk"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setShowReceipt(null)}
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
