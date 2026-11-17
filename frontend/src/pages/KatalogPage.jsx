import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiEye,
  FiPlus,
  FiArrowRight,
  FiClock,
  FiCompass,
  FiCamera,
  FiBox,
  FiSliders,
  FiFileText,
} from 'react-icons/fi';
import KatalogHeader from '../components/KatalogHeader';
import DroneSvgIllustration from '../components/DroneSvgIllustration';
import PermintaanDrawer from '../components/PermintaanDrawer';
import BandingkanDrawer from '../components/BandingkanDrawer';
import PesananSayaModal from '../components/PesananSayaModal';
import ProfilPerusahaanModal from '../components/ProfilPerusahaanModal';
import ProductDetailView from '../components/ProductDetailView';
import CustomerFooter from '../components/CustomerFooter';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/format';

const CATEGORIES = [
  { id: 'semua', label: 'Semua', count: 30 },
  { id: 'Drone', label: 'Drone', count: 7 },
  { id: 'Starter Pack', label: 'Starter Pack', count: 4 },
  { id: 'Baterai', label: 'Baterai', count: 4 },
  { id: 'Propeller', label: 'Propeller', count: 4 },
  { id: 'Controller', label: 'Controller', count: 2 },
  { id: 'Charger', label: 'Charger', count: 2 },
  { id: 'Payload & Kamera', label: 'Payload & Kamera', count: 2 },
  { id: 'Tas & Case', label: 'Tas & Case', count: 2 },
  { id: 'Aksesoris', label: 'Aksesoris', count: 3 },
];

const DEFAULT_MAX_HARGA = 400000000;
const MEREK_OPTIONS = ['Avian', 'Terra Wing', 'Kestrel Aero', 'Halcyon'];

const KatalogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    products,
    orders,
    addToPermintaanCart,
    toggleCompare,
    compareList,
    setIsCartOpen,
  } = useDamaco();

  const [searchParams, setSearchParams] = useSearchParams();
  const productId = searchParams.get('product');

  const selectedProduct = useMemo(() => {
    if (!productId || !products || products.length === 0) return null;
    const target = String(productId).toLowerCase().trim();
    const found = products.find(
      p => String(p.id).toLowerCase().trim() === target ||
           String(p.nama || '').toLowerCase().trim() === target
    );
    return found || null;
  }, [productId, products]);

  const handleOpenProduct = (prod) => {
    setSearchParams({ product: prod.id });
    // Scroll the main content area (not window) back to top
    const main = document.querySelector('.katalog-main-content');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToKatalog = () => {
    setSearchParams({});
    // Scroll the main content area (not window) back to top
    const main = document.querySelector('.katalog-main-content');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter states
  const [activeCategory, setActiveCategory] = useState('semua');
  const [selectedKetersediaan, setSelectedKetersediaan] = useState([]); // 'ready_stock' | 'stok_terbatas' | 'indent_14_hari'
  const [selectedKeperluan, setSelectedKeperluan] = useState([]); // 'Survei & Pemetaan' | 'Pertanian' | 'Fotografi & Video' | 'Inspeksi Ringan'
  const [selectedMerek, setSelectedMerek] = useState([]); // 'Avian' | 'Terra Wing' | 'Kestrel Aero' | 'Halcyon'
  const [maxHarga, setMaxHarga] = useState(DEFAULT_MAX_HARGA);
  const [sortBy, setSortBy] = useState('relevan'); // 'relevan' | 'termurah' | 'termahal' | 'nama'

  const toggleKetersediaanFilter = (val) => {
    setSelectedKetersediaan(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const toggleKeperluanFilter = (val) => {
    setSelectedKeperluan(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const toggleMerekFilter = (val) => {
    setSelectedMerek(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setActiveCategory('semua');
    setSelectedKetersediaan([]);
    setSelectedKeperluan([]);
    setSelectedMerek([]);
    setMaxHarga(DEFAULT_MAX_HARGA);
    setSortBy('relevan');
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (activeCategory !== 'semua' && p.kategori !== activeCategory) {
        return false;
      }

      // Ketersediaan filter
      if (selectedKetersediaan.length > 0 && !selectedKetersediaan.includes(p.ketersediaan)) {
        return false;
      }

      // Keperluan filter
      if (selectedKeperluan.length > 0 && !selectedKeperluan.includes(p.keperluan)) {
        return false;
      }

      // Merek filter
      if (selectedMerek.length > 0) {
        const brandMatch = selectedMerek.some(m => {
          if (m === 'Avian') return p.brand?.toLowerCase() === 'avian';
          if (m === 'Terra Wing') return p.brand?.toLowerCase() === 'terra wing' || p.brand?.toLowerCase() === 'terra';
          if (m === 'Kestrel Aero') return p.brand?.toLowerCase() === 'kestrel aero' || p.brand?.toLowerCase() === 'agro' || p.brand?.toLowerCase() === 'scout';
          if (m === 'Halcyon') return p.brand?.toLowerCase() === 'halcyon' || p.brand?.toLowerCase() === 'lumen';
          return p.brand?.toLowerCase() === m.toLowerCase();
        });
        if (!brandMatch) return false;
      }

      // Max Price filter
      if (p.harga > maxHarga) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'termurah') return a.harga - b.harga;
      if (sortBy === 'termahal') return b.harga - a.harga;
      if (sortBy === 'nama') return a.nama.localeCompare(b.nama);
      return 0; // default relevan
    });
  }, [products, activeCategory, selectedKetersediaan, selectedKeperluan, selectedMerek, maxHarga, sortBy]);

  const featuredDrone = products[0]; // Atlas M4 RTK

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-listing-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ── If a product is selected, show the full detail view ──────── */
  if (selectedProduct) {
    return (
      <div className="katalog-viewport">
        <KatalogHeader />
        <main className="katalog-main-content detail-main-wrapper">
          <ProductDetailView
            product={selectedProduct}
            onBack={handleBackToKatalog}
          />
        </main>
        <PermintaanDrawer />
        <BandingkanDrawer />
        <PesananSayaModal />
        <ProfilPerusahaanModal />
      </div>
    );
  }

  return (
    <div className="katalog-viewport">
      {/* Top Navbar */}
      <KatalogHeader />

      {/* Scrollable content area: hero + category bar (sticky) + listing */}
      <main className="katalog-main-content">
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="katalog-hero-section">
          <div className="katalog-hero-container">
            {/* Left Hero Text */}
            <div className="hero-text-col">
              <div className="hero-badge-pill">
                <span className="dot-radar" />
                <span>KATALOG B2B • {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
              </div>

              <h1 className="hero-title font-serif">
                Drone untuk kerja yang <em className="hero-em">tak boleh meleset.</em>
              </h1>

              <p className="hero-description">
                Survei, semprot lahan, hingga produksi video. Pilih dari dealer resmi, minta penawaran dalam satu langkah, dan pantau pesanan sampai dokumennya lengkap.
              </p>

              <div className="hero-actions-row">
                <button
                  type="button"
                  className="btn-hero-cta"
                  onClick={scrollToCatalog}
                >
                  <span>Lihat produk</span>
                  <FiArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Hero Card: Atlas M4 RTK Showcase */}
            <div className="hero-showcase-col">
              <div className="showcase-card">
                {/* Badge Top Right */}
                <div className="showcase-ribbon">
                  <span>Pilihan tim survei</span>
                </div>

                {/* Drone SVG Illustration on Pedestal */}
                <div className="showcase-visual-wrapper">
                  <DroneSvgIllustration height={210} />
                </div>

                {/* Showcase Meta Info */}
                <div className="showcase-meta-row">
                  <div className="showcase-titles">
                    <span className="showcase-brand">{featuredDrone.brand}</span>
                    <h2 className="showcase-name font-serif">{featuredDrone.nama}</h2>
                  </div>

                  <div className="showcase-price-box">
                    <span className="showcase-price-val font-serif">
                      Rp {formatRupiah(featuredDrone.harga)}
                    </span>
                    <span className="showcase-price-sub">Harga net, termasuk PPN</span>
                  </div>
                </div>

                {/* Showcase Quick CTA */}
                <div className="showcase-bottom-bar">
                  <button
                    type="button"
                    className="btn-showcase-view"
                    onClick={() => handleOpenProduct(featuredDrone)}
                  >
                    <FiEye size={14} /> Detail Spesifikasi
                  </button>

                  <button
                    type="button"
                    className="btn-showcase-add"
                    onClick={() => addToPermintaanCart(featuredDrone, 1)}
                  >
                    <FiPlus size={15} /> Tambah ke Permintaan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Category Filter Pills Row (Sticky under header on scroll) ── */}
        <section className="katalog-category-bar-section">
          <div className="category-bar-container">
            <div className="category-pills-scroll">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span>{cat.label}</span>
                    <span className="cat-pill-count">{cat.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <label className="sort-label">Urutkan:</label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevan">Relevan</option>
                <option value="termurah">Harga: Termurah</option>
                <option value="termahal">Harga: Termahal</option>
                <option value="nama">Nama: A - Z</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── 3. Main Catalog Listing (Filter Sidebar + Product Grid) ────── */}
        <section id="catalog-listing-section" className="katalog-listing-section">
          {/* Results bar — full width, above the grid so both columns start aligned */}
          <div className="catalog-results-bar">
            <span className="results-count-text">
              Menampilkan <strong>{filteredProducts.length}</strong> produk Damaco
              {activeCategory !== 'semua' && ` dalam kategori "${activeCategory}"`}
            </span>
          </div>

          <div className="catalog-grid-layout">
            {/* Left Filter Sidebar ("Saring") */}
            <aside className="filter-sidebar-panel">
              <div className="filter-header-row">
                <div className="filter-title-wrap">
                  <FiSliders className="filter-head-icon" />
                  <h3 className="filter-main-title font-serif">Saring</h3>
                </div>
                {(selectedKetersediaan.length > 0 || selectedKeperluan.length > 0 || selectedMerek.length > 0 || maxHarga < DEFAULT_MAX_HARGA || activeCategory !== 'semua') && (
                  <button type="button" className="btn-filter-reset" onClick={clearAllFilters}>
                    Reset
                  </button>
                )}
              </div>

              {/* Filter Group: KETERSEDIAAN */}
              <div className="filter-group-block">
                <span className="filter-group-label">KETERSEDIAAN</span>
                <div className="filter-options-stack">
                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKetersediaan.includes('ready_stock') ? 'active' : ''}`}
                    onClick={() => toggleKetersediaanFilter('ready_stock')}
                  >
                    <span className="status-dot dot-green" />
                    <span>Ready stock</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKetersediaan.includes('stok_terbatas') ? 'active' : ''}`}
                    onClick={() => toggleKetersediaanFilter('stok_terbatas')}
                  >
                    <span className="status-dot dot-amber" />
                    <span>Stok terbatas</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKetersediaan.includes('indent_14_hari') ? 'active' : ''}`}
                    onClick={() => toggleKetersediaanFilter('indent_14_hari')}
                  >
                    <span className="status-dot dot-blue" />
                    <span>Indent 14 hari</span>
                  </button>
                </div>
              </div>

              {/* Filter Group: KEPERLUAN */}
              <div className="filter-group-block">
                <span className="filter-group-label">KEPERLUAN</span>
                <div className="filter-options-stack">
                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKeperluan.includes('Survei & Pemetaan') ? 'active' : ''}`}
                    onClick={() => toggleKeperluanFilter('Survei & Pemetaan')}
                  >
                    <span>Survei & Pemetaan</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKeperluan.includes('Pertanian') ? 'active' : ''}`}
                    onClick={() => toggleKeperluanFilter('Pertanian')}
                  >
                    <span>Pertanian</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKeperluan.includes('Fotografi & Video') ? 'active' : ''}`}
                    onClick={() => toggleKeperluanFilter('Fotografi & Video')}
                  >
                    <span>Fotografi & Video</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-pill ${selectedKeperluan.includes('Inspeksi Ringan') ? 'active' : ''}`}
                    onClick={() => toggleKeperluanFilter('Inspeksi Ringan')}
                  >
                    <span>Inspeksi Ringan</span>
                  </button>
                </div>
              </div>

              {/* Filter Group: MEREK (Dibawah Keperluan) */}
              <div className="filter-group-block">
                <span className="filter-group-label">MEREK</span>
                <div className="filter-merek-grid">
                  {MEREK_OPTIONS.map(merek => {
                    const isSelected = selectedMerek.includes(merek);
                    return (
                      <button
                        key={merek}
                        type="button"
                        className={`filter-merek-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleMerekFilter(merek)}
                      >
                        <span>{merek}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Group: HARGA MAKSIMUM */}
              <div className="filter-group-block">
                <div className="filter-price-header-row">
                  <span className="filter-group-label">HARGA MAKSIMUM</span>
                  {maxHarga >= DEFAULT_MAX_HARGA ? (
                    <span className="filter-price-semua-text">Semua</span>
                  ) : (
                    <div className="filter-price-stacked-text">
                      <span className="price-prefix">Rp</span>
                      <span className="price-amount">{maxHarga.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="filter-slider-container">
                  <input
                    type="range"
                    min={10000000}
                    max={DEFAULT_MAX_HARGA}
                    step={5000000}
                    value={maxHarga}
                    onChange={(e) => setMaxHarga(Number(e.target.value))}
                    className="filter-custom-slider"
                    style={{
                      background: `linear-gradient(to right, #286845 0%, #286845 ${((maxHarga - 10000000) / (DEFAULT_MAX_HARGA - 10000000)) * 100}%, #E1E7E1 ${((maxHarga - 10000000) / (DEFAULT_MAX_HARGA - 10000000)) * 100}%, #E1E7E1 100%)`
                    }}
                    aria-label="Filter Harga Maksimum"
                  />
                </div>
              </div>

              {/* Atur Ulang Filter Button */}
              <div className="filter-reset-bottom-wrap">
                <button
                  type="button"
                  className="btn-atur-ulang-filter"
                  onClick={clearAllFilters}
                >
                  Atur ulang filter
                </button>
              </div>
            </aside>

            {/* Right Product Cards Grid */}
            <div className="catalog-products-container">
              {filteredProducts.length === 0 ? (
                <div className="catalog-empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3 className="empty-state-title font-serif">Tidak Ada Produk yang Cocok</h3>
                  <p className="empty-state-desc">
                    Silakan ubah filter ketersediaan atau keperluan untuk melihat unit lainnya.
                  </p>
                  <button type="button" className="btn-katalog-primary" onClick={clearAllFilters}>
                    Tampilkan Semua Produk (30)
                  </button>
                </div>
              ) : (
                <div className="catalog-cards-grid">
                  {filteredProducts.map(prod => {
                    const isCompared = compareList.some(item => String(item.id) === String(prod.id));

                    return (
                      <div key={prod.id} className="katalog-product-card">
                        {/* Card Top Row: Bandingkan button & Availability pill */}
                        <div className="card-top-row">
                          <button
                            type="button"
                            className={`btn-card-compare ${isCompared ? 'active' : ''}`}
                            onClick={() => toggleCompare(prod)}
                            title="Bandingkan spesifikasi unit ini"
                          >
                            <span className="compare-icon-shape">⚏</span>
                            <span>{isCompared ? 'Dipilih' : 'Bandingkan'}</span>
                          </button>

                          <div className={`card-status-pill ${prod.ketersediaan}`}>
                            <span className="status-indicator-dot" />
                            <span>
                              {prod.ketersediaan === 'ready_stock' && 'Ready stock'}
                              {prod.ketersediaan === 'stok_terbatas' && 'Stok terbatas'}
                              {prod.ketersediaan === 'indent_14_hari' && 'Indent 14 hari'}
                            </span>
                          </div>
                        </div>

                        {/* Product Illustration Visual */}
                        <div
                          className="card-visual-stage"
                          onClick={() => handleOpenProduct(prod)}
                          title="Klik untuk detail produk"
                        >
                          <DroneSvgIllustration height={130} />
                        </div>

                        {/* Product Details */}
                        <div className="card-body-content">
                          <span className="card-brand-category">
                            {prod.brand} • {prod.keperluan.toUpperCase()}
                          </span>

                          <h3
                            className="card-product-name font-serif"
                            onClick={() => handleOpenProduct(prod)}
                          >
                            {prod.nama}
                          </h3>

                          {/* 4 Specs chips matching Image 2 */}
                          <div className="card-specs-row">
                            <span className="spec-chip" title="Durasi Terbang">
                              <FiClock size={11} className="spec-icon" />
                              <span>{prod.durasi || '45 mnt'}</span>
                            </span>

                            <span className="spec-chip" title="Jarak Transmisi">
                              <FiCompass size={11} className="spec-icon" />
                              <span>{prod.jarak || '15 km'}</span>
                            </span>

                            <span className="spec-chip" title="Kamera / Sensor">
                              <FiCamera size={11} className="spec-icon" />
                              <span>{prod.kamera || '20 MP'}</span>
                            </span>

                            <span className="spec-chip" title="Bobot">
                              <FiBox size={11} className="spec-icon" />
                              <span>{prod.berat || '0,9 kg'}</span>
                            </span>
                          </div>

                          {/* Card Price & Action Button */}
                          <div className="card-price-action-row">
                            <div className="card-price-stack">
                              <span className="card-price-amount font-serif">
                                Rp {formatRupiah(prod.harga)}
                              </span>
                              <span className="card-price-tax-note">Harga net, sudah termasuk PPN</span>
                            </div>

                            <button
                              type="button"
                              className="btn-card-add"
                              onClick={() => addToPermintaanCart(prod, 1)}
                              title="Tambah ke Permintaan Penawaran"
                            >
                              <FiPlus size={15} />
                              <span>Tambah</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 4. (removed floating pill) */}
      </main>

      {/* Customer Unified Footer */}
      <CustomerFooter />

      {/* Global Modals & Drawers */}
      <PermintaanDrawer />
      <BandingkanDrawer />
      <PesananSayaModal />
      <ProfilPerusahaanModal />
    </div>
  );
};

export default KatalogPage;

