import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiGrid,
  FiClock,
  FiCompass,
  FiCamera,
  FiBox,
  FiPlus,
  FiMinus,
  FiCheck,
  FiShare2,
} from 'react-icons/fi';
import DroneSvgIllustration from './DroneSvgIllustration';
import DamacoLogo from './DamacoLogo';
import CustomerFooter from './CustomerFooter';
import { useDamaco } from '../context/DamacoContext';
import toast from 'react-hot-toast';
import { formatRupiah } from '../utils/format';

const RELATED_ACCESSORIES = [
  {
    id: 'ACC-BAT-TB65',
    nama: 'Baterai Atlas TB-65',
    brand: 'AVIAN',
    kategori: 'BATERAI',
    harga: 5250000,
    type: 'baterai',
  },
  {
    id: 'ACC-BAT-SCOUT',
    nama: 'Baterai Scout',
    brand: 'AVIAN',
    kategori: 'BATERAI',
    harga: 1450000,
    type: 'baterai',
  },
  {
    id: 'ACC-PROP-ATLAS',
    nama: 'Propeller Atlas (set 4)',
    brand: 'AVIAN',
    kategori: 'PROPELLER',
    harga: 1150000,
    type: 'propeller',
  },
  {
    id: 'ACC-PROP-SCOUT',
    nama: 'Propeller Scout (set 4)',
    brand: 'AVIAN',
    kategori: 'PROPELLER',
    harga: 195000,
    type: 'propeller',
  },
];

const ProductDetailView = ({ product, onBack }) => {
  if (!product) return null;

  const navigate = useNavigate();
  const { addToPermintaanCart, toggleCompare, compareList } = useDamaco();

  const [activeAngle, setActiveAngle] = useState('depan'); // 'depan' | 'samping' | 'atas'
  const [qty, setQty] = useState(1);

  const isCompared = (compareList || []).some(item => String(item.id) === String(product.id));

  // 8 Specific Specifications matching user reference
  const specsList = [
    {
      label: 'Waktu terbang',
      value: product.waktuTerbangDetail || `${product.durasi || '55 menit'} (tanpa beban tambahan, kondisi angin < 4 m/s)`,
    },
    {
      label: 'Jarak transmisi',
      value: product.jarakTransmisiDetail || `${product.jarak || '15 km'} FCC / 8 km CE (sinyal ganda O3 Enterprise, latensi 120 ms)`,
    },
    {
      label: 'Kamera',
      value: product.kameraDetail || `${product.kamera || '20 MP 4/3 CMOS'}, mechanical shutter 1/2000s, interval pemotretan 0.7s`,
    },
    {
      label: 'Kapasitas payload',
      value: 'Maksimum 2,7 kg dengan sistem pelepasan cepat ganda',
    },
    {
      label: 'Akurasi RTK',
      value: 'Horizontal 1 cm + 1 ppm, Vertikal 1.5 cm + 1 ppm (tanpa kalibrasi ulang)',
    },
    {
      label: 'Bobot lepas landas',
      value: `Maksimum 1.050 g (termasuk baterai dan propeller, bobot unit ${product.berat || '0,9 kg'})`,
    },
    {
      label: 'Sertifikasi',
      value: 'IP55 tahan cuaca, sertifikasi DGCA Indonesia resmi terdaftar',
    },
    {
      label: 'Garansi',
      value: '2 tahun garansi resmi Damaco Enterprise + penggantian unit 24 jam',
    },
  ];

  const handleAddToCart = () => {
    addToPermintaanCart(product, qty);
    toast.success(`${qty}x ${product.nama} ditambahkan ke permintaan!`);
  };

  const handleAddAccessory = (acc) => {
    addToPermintaanCart({
      id: acc.id,
      nama: acc.nama,
      brand: acc.brand,
      kategori: acc.kategori,
      harga: acc.harga,
      keperluan: 'Aksesoris',
      ketersediaan: 'ready_stock',
    }, 1);
    toast.success(`${acc.nama} ditambahkan ke permintaan!`);
  };

  return (
    <div className="product-detail-view-container">
      {/* ── 1. Breadcrumb Bar ─────────────────────────────────────────── */}
      <div className="detail-breadcrumb-bar">
        <button
          type="button"
          className="btn-breadcrumb-back"
          onClick={onBack}
        >
          <FiChevronLeft size={16} />
          <span>Katalog</span>
        </button>
      </div>

      {/* ── 2. Top Showcase Grid (Left: Visual, Right: Info & Action) ─── */}
      <div className="detail-showcase-grid">
        {/* Left Column: Visual Showcase Stage + Angle Selector Thumbnails */}
        <div className="showcase-visual-col">
          <div className="detail-visual-box">
            <div className="detail-visual-stage">
              <DroneSvgIllustration
                type={product.kategori === 'Baterai' ? 'baterai' : product.kategori === 'Propeller' ? 'propeller' : 'quadcopter'}
                angle={activeAngle}
                height={300}
              />
            </div>

            {/* Bottom-left Angle Tag */}
            <div className="detail-angle-badge">
              <FiGrid size={12} className="angle-badge-icon" />
              <span>TAMPAK {activeAngle.toUpperCase()}</span>
            </div>
          </div>

          {/* 3 Thumbnail Angle Selectors */}
          <div className="detail-angle-selectors-row">
            <button
              type="button"
              className={`angle-thumb-btn ${activeAngle === 'depan' ? 'active' : ''}`}
              onClick={() => setActiveAngle('depan')}
            >
              <span>Tampak Depan</span>
            </button>
            <button
              type="button"
              className={`angle-thumb-btn ${activeAngle === 'samping' ? 'active' : ''}`}
              onClick={() => setActiveAngle('samping')}
            >
              <span>Tampak Samping</span>
            </button>
            <button
              type="button"
              className={`angle-thumb-btn ${activeAngle === 'atas' ? 'active' : ''}`}
              onClick={() => setActiveAngle('atas')}
            >
              <span>Tampak Atas</span>
            </button>
          </div>
        </div>

        {/* Right Column: Meta Info, Specs Chips, Price & Actions Card */}
        <div className="showcase-info-col">
          {/* Brand & Category header */}
          <div className="detail-brand-category">
            {product.brand?.toUpperCase()} • {product.keperluan?.toUpperCase() || 'SURVEI & PEMETAAN'}
          </div>

          {/* Product Title */}
          <h1 className="detail-product-title font-serif">
            {product.nama}
          </h1>

          {/* Status badge */}
          <div className="detail-status-pill-wrap">
            <span className={`detail-status-pill ${product.ketersediaan || 'ready_stock'}`}>
              <span className="status-indicator-dot" />
              <span>
                {product.ketersediaan === 'ready_stock' && 'Ready stock'}
                {product.ketersediaan === 'stok_terbatas' && 'Stok terbatas'}
                {product.ketersediaan === 'indent_14_hari' && 'Indent 14 hari'}
              </span>
            </span>
          </div>

          {/* Description */}
          <p className="detail-description">
            {product.deskripsi ||
              'Quadcopter survei dengan modul RTK terpadu, akurasi horizontal 1 cm + 1 ppm untuk orthomosaic tanpa GCP berlebih.'}
          </p>

          {/* 4 Quick Specs Chips */}
          <div className="detail-specs-chips-row">
            <span className="detail-spec-chip" title="Waktu Terbang">
              <FiClock size={13} className="chip-icon" />
              <span>{product.durasi || '55 mnt'}</span>
            </span>
            <span className="detail-spec-chip" title="Jarak Transmisi">
              <FiCompass size={13} className="chip-icon" />
              <span>{product.jarak || '15 km'}</span>
            </span>
            <span className="detail-spec-chip" title="Kamera / Sensor">
              <FiCamera size={13} className="chip-icon" />
              <span>{product.kamera || '20 MP mekanis'}</span>
            </span>
            <span className="detail-spec-chip" title="Bobot Unit">
              <FiBox size={13} className="chip-icon" />
              <span>{product.berat || '0,9 kg'}</span>
            </span>
          </div>

          {/* Price & Action Card */}
          <div className="detail-action-card">
            <div className="detail-action-price-box">
              <span className="detail-action-price font-serif">
                Rp {formatRupiah(product.harga)}
              </span>
              <span className="detail-action-tax-note">
                Harga net, sudah termasuk PPN. Tidak dapat dinegosiasikan.
              </span>
            </div>

            {/* Stepper & Primary CTA Button */}
            <div className="detail-action-stepper-row">
              <div className="detail-qty-stepper">
                <button
                  type="button"
                  className="btn-stepper-step"
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  disabled={qty <= 1}
                  aria-label="Kurangi jumlah"
                >
                  <FiMinus size={13} />
                </button>
                <span className="stepper-qty-val">{qty}</span>
                <button
                  type="button"
                  className="btn-stepper-step"
                  onClick={() => setQty(prev => prev + 1)}
                  aria-label="Tambah jumlah"
                >
                  <FiPlus size={13} />
                </button>
              </div>

              <button
                type="button"
                className="btn-detail-add-primary"
                onClick={handleAddToCart}
              >
                <FiPlus size={16} />
                <span>Tambah ke permintaan</span>
              </button>
            </div>

            {/* Compare Button */}
            <button
              type="button"
              className={`btn-detail-compare ${isCompared ? 'active' : ''}`}
              onClick={() => toggleCompare(product)}
            >
              <span className="compare-icon-shape">⚏</span>
              <span>{isCompared ? 'Terpilih di perbandingan' : 'Bandingkan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Section: Spesifikasi ───────────────────────────────────── */}
      <section className="detail-specs-section">
        <h2 className="detail-section-title font-serif">Spesifikasi</h2>

        <div className="detail-specs-table-card">
          {specsList.map((spec, index) => (
            <div key={index} className="detail-spec-row">
              <div className="spec-label-col">{spec.label}</div>
              <div className="spec-value-col">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Section: Aksesori Terkait ──────────────────────────────── */}
      <section className="detail-accessories-section">
        <h2 className="detail-section-title font-serif">Aksesori terkait</h2>

        <div className="detail-accessories-grid">
          {RELATED_ACCESSORIES.map(acc => (
            <div key={acc.id} className="accessory-card">
              <div className="accessory-visual-box">
                <DroneSvgIllustration
                  type={acc.type}
                  height={120}
                />
              </div>

              <div className="accessory-content">
                <span className="accessory-brand-cat">{acc.brand} • {acc.kategori}</span>
                <h3 className="accessory-name font-serif">{acc.nama}</h3>

                <div className="accessory-price-row">
                  <span className="accessory-price-val font-serif">
                    Rp {formatRupiah(acc.harga)}
                  </span>

                  <button
                    type="button"
                    className="btn-accessory-add"
                    onClick={() => handleAddAccessory(acc)}
                  >
                    <FiPlus size={13} />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Footer matching reference ─────────────────────────────── */}
      <CustomerFooter />
    </div>
  );
};

export default ProductDetailView;
