import React, { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiTag, FiBox, FiImage, FiSettings, FiDollarSign, FiInfo } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import DroneSvgIllustration from '../components/DroneSvgIllustration';
import { formatRupiah } from '../utils/format';

const EMPTY_FORM = {
  // ── Informasi Dasar
  nama: '',
  brand: 'AVIAN',
  kategori: 'Drone',
  keperluan: 'Survei & Pemetaan',
  satuan: 'unit',
  ketersediaan: 'ready_stock',
  isPilihan: false,
  badgeText: '',
  // ── Harga & Stok
  harga: '',
  hargaBeli: '',
  stok: '',
  // ── Visual & Gambar
  visualType: 'quadcopter',  // 'quadcopter' | 'baterai' | 'propeller'
  imageDepan: '',
  imageSamping: '',
  imageAtas: '',
  // ── Spesifikasi Teknis
  durasi: '',       // Waktu terbang (singkat, tampil di chip)
  jarak: '',        // Jarak transmisi (singkat)
  kamera: '',       // Kamera / sensor (singkat)
  berat: '',        // Bobot unit (singkat)
  waktuTerbangDetail: '',
  jarakTransmisiDetail: '',
  kameraDetail: '',
  akurasiRtk: '',
  garansi: '',
  // ── Deskripsi
  deskripsi: '',
};

const KelolaProdukPage = () => {
  const { products, handleSaveProduct, handleDeleteProduct } = useDamaco();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dasar'); // 'dasar' | 'visual' | 'spesifikasi' | 'harga'

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const filteredProducts = products.filter(p =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setActiveTab('dasar');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setForm({
      nama: prod.nama || '',
      brand: prod.brand || 'AVIAN',
      kategori: prod.kategori || 'Drone',
      keperluan: prod.keperluan || 'Survei & Pemetaan',
      satuan: prod.satuan || 'unit',
      ketersediaan: prod.ketersediaan || 'ready_stock',
      isPilihan: prod.isPilihan || false,
      badgeText: prod.badgeText || '',
      harga: prod.harga || '',
      hargaBeli: prod.hargaBeli || '',
      stok: prod.stok || '',
      visualType: prod.visualType || 'quadcopter',
      imageDepan: prod.imageDepan || '',
      imageSamping: prod.imageSamping || '',
      imageAtas: prod.imageAtas || '',
      durasi: prod.durasi || '',
      jarak: prod.jarak || '',
      kamera: prod.kamera || '',
      berat: prod.berat || '',
      waktuTerbangDetail: prod.waktuTerbangDetail || '',
      jarakTransmisiDetail: prod.jarakTransmisiDetail || '',
      kameraDetail: prod.kameraDetail || '',
      akurasiRtk: prod.akurasiRtk || '',
      garansi: prod.garansi || '',
      deskripsi: prod.deskripsi || '',
    });
    setActiveTab('dasar');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveProduct({
      id: editingProduct?.id,
      kode: editingProduct?.kode,
      nama: form.nama,
      brand: form.brand,
      kategori: form.kategori,
      keperluan: form.keperluan,
      satuan: form.satuan,
      ketersediaan: form.ketersediaan,
      isPilihan: form.isPilihan,
      badgeText: form.badgeText,
      harga: parseFloat(form.harga) || 0,
      hargaBeli: parseFloat(form.hargaBeli) || 0,
      stok: parseInt(form.stok) || 0,
      visualType: form.visualType,
      imageDepan: form.imageDepan,
      imageSamping: form.imageSamping,
      imageAtas: form.imageAtas,
      durasi: form.durasi,
      jarak: form.jarak,
      kamera: form.kamera,
      berat: form.berat,
      waktuTerbangDetail: form.waktuTerbangDetail,
      jarakTransmisiDetail: form.jarakTransmisiDetail,
      kameraDetail: form.kameraDetail,
      akurasiRtk: form.akurasiRtk,
      garansi: form.garansi,
      deskripsi: form.deskripsi,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="damaco-subpage-wrapper">
      <div className="subpage-header">
        <div>
          <h1 className="subpage-title font-serif">Kelola Produk Damaco</h1>
          <p className="subpage-subtitle">Inventaris unit drone, sensor fotogrametri, dan paket operasional enterprise</p>
        </div>
        <button className="damaco-action-btn" onClick={handleOpenAdd}>
          <FiPlus /> Tambah Produk Baru
        </button>
      </div>

      <div className="damaco-table-card">
        <div className="table-controls-bar">
          <div className="table-search-box" style={{ maxWidth: 360 }}>
            <FiSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Cari produk atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 13, color: '#64748B' }}>
            Total <strong>{products.length}</strong> produk terdaftar
          </div>
        </div>

        <div className="table-scroll-container">
          <table className="damaco-data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Spesifikasi Singkat</th>
                <th style={{ textAlign: 'center' }}>Stok Gudang</th>
                <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td><span className="search-badge-code">{p.kode}</span></td>
                  <td><strong>{p.nama}</strong></td>
                  <td><span className="category-pill">{p.kategori}</span></td>
                  <td style={{ fontSize: 12, color: '#64748B', maxWidth: 280 }}>{p.deskripsi}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`stock-badge ${p.stok < 8 ? 'low' : 'good'}`}>
                      {p.stok} {p.satuan}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    Rp {formatRupiah(p.harga)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon-table"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit produk"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon-table"
                        onClick={() => handleDeleteProduct(p)}
                        title="Hapus produk"
                        style={{ color: '#DC2626' }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="damaco-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="damaco-modal-container form-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 720, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="modal-header" style={{ padding: '20px 24px 0', flexShrink: 0 }}>
              <h2 className="modal-title font-serif" style={{ marginBottom: 0 }}>
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h2>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E8F1E9', marginTop: 16 }}>
                {[
                  { id: 'dasar', label: 'Informasi Dasar', icon: <FiInfo size={13} /> },
                  { id: 'visual', label: 'Visual & Gambar', icon: <FiImage size={13} /> },
                  { id: 'spesifikasi', label: 'Spesifikasi', icon: <FiSettings size={13} /> },
                  { id: 'harga', label: 'Harga & Stok', icon: <FiDollarSign size={13} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 16px',
                      fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                      color: activeTab === tab.id ? '#286845' : '#64748B',
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: activeTab === tab.id ? '2px solid #286845' : '2px solid transparent',
                      marginBottom: -2,
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Body — scrollable */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* ── Tab 1: Informasi Dasar ──────────────────────────── */}
                {activeTab === 'dasar' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-section">
                      <label className="damaco-label">Nama Produk *</label>
                      <input
                        type="text"
                        required
                        className="damaco-input"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        placeholder="Contoh: Atlas M4 RTK Enterprise"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-section">
                        <label className="damaco-label">Brand</label>
                        <select
                          className="damaco-input select-styled"
                          value={form.brand}
                          onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        >
                          <option value="AVIAN">AVIAN</option>
                          <option value="TERRA">TERRA</option>
                          <option value="LUMEN">LUMEN</option>
                          <option value="AGRI">AGRI</option>
                          <option value="KESTREL">KESTREL</option>
                          <option value="HALCYON">HALCYON</option>
                          <option value="DAMACO">DAMACO</option>
                        </select>
                      </div>
                      <div className="form-section">
                        <label className="damaco-label">Kategori</label>
                        <select
                          className="damaco-input select-styled"
                          value={form.kategori}
                          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                        >
                          <option value="Drone">Drone</option>
                          <option value="Starter Pack">Starter Pack</option>
                          <option value="Baterai">Baterai</option>
                          <option value="Propeller">Propeller</option>
                          <option value="Controller">Controller</option>
                          <option value="Charger">Charger</option>
                          <option value="Payload & Kamera">Payload &amp; Kamera</option>
                          <option value="Tas & Case">Tas &amp; Case</option>
                          <option value="Aksesoris">Aksesoris</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-section">
                        <label className="damaco-label">Keperluan</label>
                        <select
                          className="damaco-input select-styled"
                          value={form.keperluan}
                          onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                        >
                          <option value="Survei & Pemetaan">Survei &amp; Pemetaan</option>
                          <option value="Inspeksi & Keamanan">Inspeksi &amp; Keamanan</option>
                          <option value="Pertanian Presisi">Pertanian Presisi</option>
                          <option value="Sinematografi Udara">Sinematografi Udara</option>
                          <option value="Aksesoris">Aksesoris</option>
                        </select>
                      </div>
                      <div className="form-section">
                        <label className="damaco-label">Satuan</label>
                        <select
                          className="damaco-input select-styled"
                          value={form.satuan}
                          onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                        >
                          <option value="unit">unit</option>
                          <option value="paket">paket</option>
                          <option value="set">set</option>
                          <option value="pcs">pcs</option>
                          <option value="pasang">pasang</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-section">
                      <label className="damaco-label">Status Ketersediaan</label>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                          { val: 'ready_stock', label: '✅ Ready Stock' },
                          { val: 'stok_terbatas', label: '⚠️ Stok Terbatas' },
                          { val: 'indent_14_hari', label: '🕐 Indent 14 Hari' },
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setForm({ ...form, ketersediaan: opt.val })}
                            style={{
                              padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                              border: form.ketersediaan === opt.val ? '2px solid #286845' : '1.5px solid #E2E8F0',
                              background: form.ketersediaan === opt.val ? '#E8F5ED' : '#F8FAFC',
                              color: form.ketersediaan === opt.val ? '#286845' : '#64748B',
                              fontWeight: form.ketersediaan === opt.val ? 600 : 400,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Badge Pilihan */}
                    <div className="form-section">
                      <label className="damaco-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={form.isPilihan}
                          onChange={(e) => setForm({ ...form, isPilihan: e.target.checked })}
                          style={{ accentColor: '#286845', width: 15, height: 15 }}
                        />
                        Tandai sebagai &quot;Pilihan Tim&quot;
                      </label>
                      {form.isPilihan && (
                        <input
                          type="text"
                          className="damaco-input"
                          style={{ marginTop: 8 }}
                          value={form.badgeText}
                          onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                          placeholder='Contoh: Pilihan tim survei'
                        />
                      )}
                    </div>

                    <div className="form-section">
                      <label className="damaco-label">Deskripsi Produk</label>
                      <textarea
                        rows={4}
                        className="damaco-input textarea-styled"
                        value={form.deskripsi}
                        onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                        placeholder="Deskripsi singkat produk yang tampil di katalog..."
                      />
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Visual & Gambar ──────────────────────────── */}
                {activeTab === 'visual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Tipe Ilustrasi SVG */}
                    <div className="form-section">
                      <label className="damaco-label">Tipe Ilustrasi (SVG Otomatis)</label>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                        Digunakan ketika URL gambar kosong. Pilih tipe yang paling mendekati produk.
                      </p>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {['quadcopter', 'baterai', 'propeller'].map(vt => (
                          <button
                            key={vt}
                            type="button"
                            onClick={() => setForm({ ...form, visualType: vt })}
                            style={{
                              flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                              border: form.visualType === vt ? '2px solid #286845' : '1.5px solid #E2E8F0',
                              background: form.visualType === vt ? '#E8F5ED' : '#F8FAFC',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                            }}
                          >
                            <div style={{ width: 100, height: 60, pointerEvents: 'none' }}>
                              <DroneSvgIllustration type={vt} angle="depan" height={60} />
                            </div>
                            <span style={{
                              fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                              color: form.visualType === vt ? '#286845' : '#64748B',
                            }}>
                              {vt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multi-angle image URLs */}
                    {[
                      { key: 'imageDepan', label: 'Tampak Depan', angle: 'depan', placeholder: 'URL gambar tampak depan (opsional)' },
                      { key: 'imageSamping', label: 'Tampak Samping', angle: 'samping', placeholder: 'URL gambar tampak samping (opsional)' },
                      { key: 'imageAtas', label: 'Tampak Atas', angle: 'atas', placeholder: 'URL gambar tampak atas (opsional)' },
                    ].map(({ key, label, angle, placeholder }) => (
                      <div key={key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, alignItems: 'flex-start' }}>
                        {/* Preview thumbnail */}
                        <div style={{
                          border: '1.5px solid #E2E8F0', borderRadius: 10,
                          background: '#F7F8F5', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: 90,
                        }}>
                          {form[key] ? (
                            <img
                              src={form[key]}
                              alt={label}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <DroneSvgIllustration type={form.visualType} angle={angle} height={80} />
                          )}
                        </div>
                        <div className="form-section" style={{ margin: 0 }}>
                          <label className="damaco-label">{label}</label>
                          <input
                            type="url"
                            className="damaco-input"
                            value={form[key]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            placeholder={placeholder}
                          />
                          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                            Kosongkan untuk pakai ilustrasi SVG otomatis
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Tab 3: Spesifikasi Teknis ───────────────────────── */}
                {activeTab === 'spesifikasi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: '#E8F5ED', border: '1px solid #C6E0CF',
                      fontSize: 12, color: '#286845',
                    }}>
                      💡 Spesifikasi singkat tampil sebagai chip di halaman katalog. Spesifikasi detail tampil di halaman produk.
                    </div>

                    {/* Chip Specs (singkat) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { key: 'durasi', label: '⏱ Waktu Terbang (singkat)', placeholder: 'contoh: 55 mnt' },
                        { key: 'jarak', label: '📡 Jarak Transmisi (singkat)', placeholder: 'contoh: 15 km' },
                        { key: 'kamera', label: '📷 Kamera / Sensor (singkat)', placeholder: 'contoh: 20 MP 4/3' },
                        { key: 'berat', label: '⚖ Bobot Unit (singkat)', placeholder: 'contoh: 0,9 kg' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key} className="form-section">
                          <label className="damaco-label">{label}</label>
                          <input
                            type="text"
                            className="damaco-input"
                            value={form[key]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1.5px solid #E8F1E9', margin: '4px 0' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>Spesifikasi Detail (halaman produk)</p>

                    {[
                      { key: 'waktuTerbangDetail', label: 'Detail Waktu Terbang', placeholder: 'cth: 55 menit (tanpa beban, angin < 4 m/s)' },
                      { key: 'jarakTransmisiDetail', label: 'Detail Jarak Transmisi', placeholder: 'cth: 15 km FCC / 8 km CE (O3 Enterprise, latensi 120 ms)' },
                      { key: 'kameraDetail', label: 'Detail Kamera / Sensor', placeholder: 'cth: 20 MP 4/3 CMOS, mechanical shutter 1/2000s' },
                      { key: 'akurasiRtk', label: 'Akurasi RTK', placeholder: 'cth: Horizontal 1 cm + 1 ppm, Vertikal 1,5 cm + 1 ppm' },
                      { key: 'garansi', label: 'Garansi', placeholder: 'cth: 2 Tahun Garansi Resmi Damaco Enterprise' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="form-section">
                        <label className="damaco-label">{label}</label>
                        <input
                          type="text"
                          className="damaco-input"
                          value={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Tab 4: Harga & Stok ─────────────────────────────── */}
                {activeTab === 'harga' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-section">
                        <label className="damaco-label">Harga Jual B2B (Rp) *</label>
                        <input
                          type="number"
                          required
                          className="damaco-input"
                          value={form.harga}
                          onChange={(e) => setForm({ ...form, harga: e.target.value })}
                          placeholder="148500000"
                        />
                        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          Harga net sudah termasuk PPN
                        </p>
                      </div>
                      <div className="form-section">
                        <label className="damaco-label">Harga Modal / Beli (Rp)</label>
                        <input
                          type="number"
                          className="damaco-input"
                          value={form.hargaBeli}
                          onChange={(e) => setForm({ ...form, hargaBeli: e.target.value })}
                          placeholder="120000000"
                        />
                        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          Internal only — untuk kalkulasi margin
                        </p>
                      </div>
                    </div>

                    {/* Margin preview */}
                    {form.harga && form.hargaBeli && (
                      <div style={{
                        padding: '12px 16px', borderRadius: 10,
                        background: parseFloat(form.harga) > parseFloat(form.hargaBeli) ? '#E8F5ED' : '#FEF2F2',
                        border: `1px solid ${parseFloat(form.harga) > parseFloat(form.hargaBeli) ? '#C6E0CF' : '#FECACA'}`,
                      }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: parseFloat(form.harga) > parseFloat(form.hargaBeli) ? '#286845' : '#DC2626' }}>
                          {parseFloat(form.harga) > parseFloat(form.hargaBeli) ? '✅' : '⚠️'} Margin:
                          Rp {(parseFloat(form.harga) - parseFloat(form.hargaBeli)).toLocaleString('id-ID')}
                          {' '}({(((parseFloat(form.harga) - parseFloat(form.hargaBeli)) / parseFloat(form.hargaBeli)) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-section">
                        <label className="damaco-label">Stok Tersedia *</label>
                        <input
                          type="number"
                          required
                          className="damaco-input"
                          value={form.stok}
                          onChange={(e) => setForm({ ...form, stok: e.target.value })}
                          placeholder="10"
                        />
                      </div>
                      <div className="form-section">
                        <label className="damaco-label">Satuan</label>
                        <select
                          className="damaco-input select-styled"
                          value={form.satuan}
                          onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                        >
                          <option value="unit">unit</option>
                          <option value="paket">paket</option>
                          <option value="set">set</option>
                          <option value="pcs">pcs</option>
                          <option value="pasang">pasang</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="order-modal-footer" style={{
                flexShrink: 0, padding: '14px 24px',
                borderTop: '1.5px solid #E8F1E9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#fff',
              }}>
                <div>
                  {editingProduct && (
                    <button
                      type="button"
                      className="btn-damaco-cancel"
                      onClick={() => { setIsModalOpen(false); handleDeleteProduct(editingProduct); }}
                      style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                    >
                      <FiTrash2 style={{ marginRight: 6 }} /> Hapus Produk
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Tab navigation prev/next */}
                  {activeTab !== 'dasar' && (
                    <button
                      type="button"
                      className="btn-damaco-cancel"
                      onClick={() => {
                        const tabs = ['dasar', 'visual', 'spesifikasi', 'harga'];
                        const idx = tabs.indexOf(activeTab);
                        setActiveTab(tabs[idx - 1]);
                      }}
                    >
                      ← Kembali
                    </button>
                  )}
                  {activeTab !== 'harga' ? (
                    <button
                      type="button"
                      className="btn-damaco-primary"
                      onClick={() => {
                        const tabs = ['dasar', 'visual', 'spesifikasi', 'harga'];
                        const idx = tabs.indexOf(activeTab);
                        setActiveTab(tabs[idx + 1]);
                      }}
                    >
                      Lanjut →
                    </button>
                  ) : (
                    <>
                      <button type="button" className="btn-damaco-cancel" onClick={() => setIsModalOpen(false)}>
                        Batal
                      </button>
                      <button type="submit" className="btn-damaco-primary">
                        {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaProdukPage;

