import React from 'react';
import { FiX, FiCheck, FiCopy } from 'react-icons/fi';
import DamacoLogo from './DamacoLogo';
import { useDamaco } from '../context/DamacoContext';
import toast from 'react-hot-toast';

const StyleGuideModal = () => {
  const { isStyleGuideOpen, setIsStyleGuideOpen } = useDamaco();

  if (!isStyleGuideOpen) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    toast.success(`Kode warna ${label} (${text}) disalin!`);
  };

  const colors = [
    { name: 'Damaco Crimson', hex: '#DC2626', role: 'Action Primary / Pill Buttons / Badges' },
    { name: 'Deep Crimson', hex: '#991B1B', role: 'Avatar & Dark Gradient Stop' },
    { name: 'Obsidian Navy', hex: '#0F172A', role: 'Active Sidebar Navigation / Count Pills' },
    { name: 'Warm Linen', hex: '#FAF8F5', role: 'Canvas Background' },
    { name: 'Pure White', hex: '#FFFFFF', role: 'Card Surfaces / Inputs' },
    { name: 'Warm Border', hex: '#EBE7DF', role: 'Card & Container Outlines' },
    { name: 'Text Charcoal', hex: '#1E293B', role: 'Primary Typography' },
    { name: 'Muted Slate', hex: '#64748B', role: 'Subtitles, Metadata, Icons' },
  ];

  return (
    <div className="damaco-modal-backdrop" onClick={() => setIsStyleGuideOpen(false)}>
      <div className="damaco-modal-container styleguide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <DamacoLogo size="medium" />
            <div style={{ marginLeft: 8 }}>
              <h2 className="modal-title">Panduan Gaya Desain (Design System)</h2>
              <p className="modal-subtitle">Standar identitas visual, tipografi, warna, dan komponen UI Damaco</p>
            </div>
          </div>
          <button className="portal-btn-close" onClick={() => setIsStyleGuideOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body styleguide-body">
          {/* Section: Typography */}
          <div className="sg-section">
            <h3 className="sg-section-title">1. Tipografi (Typography)</h3>
            <div className="sg-typo-grid">
              <div className="sg-typo-card">
                <span className="sg-typo-badge">Editorial Serif</span>
                <p className="sg-font-sample-serif">Playfair Display / Georgia</p>
                <span className="sg-typo-note">Digunakan untuk Hero Greeting ("Selamat pagi, Rina."), Judul Bagian ("Butuh tindakan Anda"), dan Logo Brand.</span>
              </div>
              <div className="sg-typo-card">
                <span className="sg-typo-badge">Clean Sans-Serif</span>
                <p className="sg-font-sample-sans">Plus Jakarta Sans / Inter</p>
                <span className="sg-typo-note">Digunakan untuk Navigation, Data Tables, Stat Cards, Form Inputs, dan Action Buttons.</span>
              </div>
            </div>
          </div>

          {/* Section: Palette */}
          <div className="sg-section">
            <h3 className="sg-section-title">2. Palet Warna (Color Palette)</h3>
            <div className="sg-palette-grid">
              {colors.map((c) => (
                <div
                  key={c.hex}
                  className="sg-color-card"
                  onClick={() => copyToClipboard(c.hex, c.name)}
                >
                  <div className="sg-color-swatch" style={{ background: c.hex }} />
                  <div className="sg-color-meta">
                    <strong>{c.name}</strong>
                    <code>{c.hex}</code>
                    <small>{c.role}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Button & Badge Components */}
          <div className="sg-section">
            <h3 className="sg-section-title">3. Komponen Aksi & Indikator</h3>
            <div className="sg-components-preview">
              <div className="sg-comp-item">
                <label>Primary Action Pill Button:</label>
                <button className="damaco-action-btn">
                  Terbitkan penawaran →
                </button>
              </div>
              <div className="sg-comp-item">
                <label>Status Badge Count (Red):</label>
                <span className="nav-badge-count" style={{ display: 'inline-block' }}>13</span>
              </div>
              <div className="sg-comp-item">
                <label>Group Counter Badge (Navy):</label>
                <span className="card-badge-count" style={{ display: 'inline-flex' }}>2</span>
              </div>
              <div className="sg-comp-item">
                <label>Card Highlight Stroke:</label>
                <div style={{ border: '1px solid #FECACA', padding: '6px 14px', borderRadius: 10, background: '#FFF' }}>
                  <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 18 }}>13</span> Butuh tindakan
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleGuideModal;

