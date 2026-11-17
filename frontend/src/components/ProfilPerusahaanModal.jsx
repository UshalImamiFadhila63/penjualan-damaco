import React from 'react';
import {
  FiX,
  FiShield,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiAward,
  FiFileText,
  FiCreditCard,
  FiExternalLink,
} from 'react-icons/fi';
import DamacoLogo from './DamacoLogo';
import { useDamaco } from '../context/DamacoContext';

const ProfilPerusahaanModal = () => {
  const { isProfilPerusahaanOpen, setIsProfilPerusahaanOpen } = useDamaco();

  if (!isProfilPerusahaanOpen) return null;

  return (
    <div
      className="katalog-modal-backdrop"
      onClick={() => setIsProfilPerusahaanOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="katalog-modal-container profil-perusahaan-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <DamacoLogo size="medium" />
            <div>
              <span className="order-badge-quote" style={{ background: '#E8F1E9', color: '#286845' }}>
                PROFIL RESMI PERUSAHAAN
              </span>
              <h3 className="modal-title font-serif" style={{ marginTop: 4, fontSize: '20px' }}>
                PT Damaco Teknologi Presisi
              </h3>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsProfilPerusahaanOpen(false)}
            aria-label="Tutup modal profil"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Company Brief */}
          <div
            style={{
              background: '#F7F8F5',
              border: '1px solid #E1E7E1',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <p style={{ fontSize: '13.5px', color: '#18251F', lineHeight: '1.6', margin: 0 }}>
              <strong>PT Damaco Teknologi Presisi</strong> adalah distributor resmi tunggal perangkat drone industri,
              sensor LiDAR, dan payload geospasial presisi tinggi di Indonesia. Melayani kebutuhan B2B sektor
              perkebunan, survei tambang, konstruksi nasional, dan instansi pemerintah.
            </p>
          </div>

          {/* Legalitas & Kredensial Grid */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#6B776F', textTransform: 'uppercase', marginBottom: '10px' }}>
              Legalitas & Sertifikasi Resmi
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E1E7E1',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <FiShield style={{ color: '#286845', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18251F' }}>Authorized Drone Partner</div>
                  <div style={{ fontSize: '11.5px', color: '#6B776F' }}>Reseller resmi unit Avian, Terra & Lumen di RI</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E1E7E1',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <FiAward style={{ color: '#286845', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18251F' }}>ISO 9001:2015 & DJPU</div>
                  <div style={{ fontSize: '11.5px', color: '#6B776F' }}>Tersertifikasi standar keselamatan dirgantara</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E1E7E1',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <FiFileText style={{ color: '#286845', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18251F' }}>TKDN & PPN Faktur Resmi</div>
                  <div style={{ fontSize: '11.5px', color: '#6B776F' }}>NPWP terdaftar DJP, menerbitkan e-Faktur resmi</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E1E7E1',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <FiCheckCircle style={{ color: '#286845', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18251F' }}>Garansi Resmi 12 Bulan</div>
                  <div style={{ fontSize: '11.5px', color: '#6B776F' }}>Pusat servis & ketersediaan sparepart di Cikarang</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rekening Pembayaran Resmi */}
          <div
            style={{
              background: '#E8F1E9',
              border: '1px solid #D2E2D4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiCreditCard style={{ color: '#286845', fontSize: '18px' }} />
              <strong style={{ fontSize: '13px', color: '#18251F' }}>Rekening Resmi Pembayaran B2B:</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#18251F', lineHeight: '1.5' }}>
              <strong>Bank Mandiri</strong> — Cabang Kawasan Industri Cikarang<br />
              Nomor Rekening: <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>123-00-9988776-5</span><br />
              Atas Nama: <strong>PT DAMACO TEKNOLOGI PRESISI</strong>
            </div>
            <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#6B776F' }}>
              * Seluruh pembayaran transaksi hanya sah dilakukan ke nomor rekening resmi PT Damaco Teknologi Presisi di atas.
            </small>
          </div>

          {/* Kontak & Lokasi */}
          <div>
            <h4 style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#6B776F', textTransform: 'uppercase', marginBottom: '10px' }}>
              Pusat Operasional & Hub B2B
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#18251F' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <FiMapPin style={{ color: '#286845', marginTop: '3px', flexShrink: 0 }} />
                <span>Kawasan Industri Modern Cikarang Blok C-12, Bekasi, Jawa Barat 17530</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiPhone style={{ color: '#286845', flexShrink: 0 }} />
                <span>(021) 8990-8800 • Hotline B2B: +62 811-2345-6789 (WhatsApp Enterprise)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiMail style={{ color: '#286845', flexShrink: 0 }} />
                <span>enterprise@damaco.id • tender@damaco.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E1E7E1',
            background: '#F7F8F5',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            className="btn-katalog-primary"
            onClick={() => setIsProfilPerusahaanOpen(false)}
            style={{
              background: '#286845',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 22px',
              borderRadius: '999px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilPerusahaanModal;

