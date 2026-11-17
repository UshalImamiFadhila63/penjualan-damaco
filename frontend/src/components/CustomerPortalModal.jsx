import React, { useRef } from 'react';
import { FiX, FiPrinter, FiDownload, FiCheckCircle, FiShare2, FiAlertCircle } from 'react-icons/fi';
import DamacoLogo from './DamacoLogo';
import { useDamaco } from '../context/DamacoContext';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const CustomerPortalModal = () => {
  const {
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    selectedOrderForCustomerView,
    orders,
  } = useDamaco();

  const printAreaRef = useRef(null);

  if (!isCustomerModalOpen) return null;

  // Always bind to the live order in orders array to keep status in real-time sync with Admin updates,
  // but preserve specific document preview metadata (docTitle, docType, docKode) passed into openCustomerView
  const baseOrder =
    (orders || []).find(
      (o) => o.id === selectedOrderForCustomerView?.id || o.nomor === selectedOrderForCustomerView?.nomor
    ) ||
    selectedOrderForCustomerView ||
    (orders && orders[0]) ||
    {};

  const order = {
    ...baseOrder,
    docTitle: selectedOrderForCustomerView?.docTitle || baseOrder.docTitle,
    docType: selectedOrderForCustomerView?.docType || baseOrder.docType,
    docKode: selectedOrderForCustomerView?.docKode || baseOrder.docKode,
    nomorDokumen: selectedOrderForCustomerView?.docKode || selectedOrderForCustomerView?.nomor || baseOrder.nomor,
  };

  const handlePrint = () => {
    const element = printAreaRef.current || document.getElementById('portal-document-paper-print');
    if (!element) return;

    const cleanNo = (order.nomorDokumen || order.nomor || 'DOKUMEN').replace(/[\/\\]/g, '-');
    const docTitle = `${(docInfo.headerTitle || 'DOKUMEN').replace(/\s+/g, '_')}_${cleanNo}`;

    // Gunakan iframe khusus tersembunyi agar preview cetak terisolasi dan TIDAK PERNAH BLANK
    let printFrame = document.getElementById('print-iframe-helper');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'print-iframe-helper';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 0; /* Menghilangkan URL localhost dan title header bawaan browser */
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1E293B;
              background: #FFFFFF;
              padding: 14mm 16mm;
              margin: 0;
            }
            .portal-document-paper {
              width: 100%;
              background: #FFFFFF;
              color: #1E293B;
              padding: 0;
            }
            .doc-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .doc-company-sub {
              font-weight: 600;
              font-size: 13px;
              color: #18251F;
              margin-top: 6px;
            }
            .doc-company-address {
              font-size: 11.5px;
              color: #64748B;
              line-height: 1.5;
              margin-top: 2px;
            }
            .doc-title {
              font-family: Georgia, serif;
              font-size: 22px;
              font-weight: 700;
              color: #18251F;
              text-align: right;
              margin-bottom: 10px;
              letter-spacing: 0.05em;
            }
            .doc-meta-table td {
              font-size: 12px;
              padding: 2px 6px;
              text-align: right;
            }
            .doc-meta-table td:first-child {
              color: #64748B;
            }
            .doc-status-badge {
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 10.5px;
              font-weight: 600;
              display: inline-block;
            }
            .doc-divider {
              height: 1px;
              background: #E2E8F0;
              margin: 20px 0;
            }
            .doc-customer-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              background: #FAF8F5 !important;
              padding: 16px 20px;
              border-radius: 12px;
              border: 1px solid #E2E8F0;
              margin-bottom: 24px;
            }
            .section-label {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.1em;
              color: #64748B;
              margin-bottom: 4px;
              display: block;
            }
            .customer-company-name {
              font-size: 15px;
              font-weight: 700;
              color: #18251F;
            }
            .customer-person, .customer-address, .delivery-spec, .delivery-notes {
              font-size: 11.5px;
              color: #475569;
              line-height: 1.4;
            }
            .doc-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .doc-table th {
              background: #F1ECE4 !important;
              color: #18251F;
              font-size: 12px;
              font-weight: 600;
              padding: 10px 12px;
              text-align: left;
              border-bottom: 2px solid #E2E8F0;
            }
            .doc-table td {
              padding: 12px;
              font-size: 12.5px;
              border-bottom: 1px solid #F1F5F9;
            }
            .item-title {
              font-weight: 600;
              color: #18251F;
            }
            .item-sub {
              font-size: 11px;
              color: #64748B;
            }
            .doc-summary-grid {
              display: grid;
              grid-template-columns: 1fr 300px;
              gap: 28px;
              margin-top: 12px;
              padding-top: 16px;
              border-top: 1px solid #E2E8F0;
              page-break-inside: avoid;
            }
            .payment-bank-info .bank-card {
              background: #FAF8F5 !important;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid #E2E8F0;
              font-size: 11.5px;
              line-height: 1.6;
            }
            .totals-calculation {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              font-size: 12.5px;
              color: #475569;
            }
            .calc-row.total-highlight {
              border-top: 2px solid #18251F;
              padding-top: 10px;
              margin-top: 6px;
              font-size: 14px;
              font-weight: 700;
              color: #18251F;
            }
            .grand-total-amount {
              font-size: 17px;
              color: #286845;
              font-weight: 700;
            }
            .doc-signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 36px;
              padding-top: 20px;
              page-break-inside: avoid;
            }
            .sig-box {
              display: flex;
              flex-direction: column;
            }
            .sig-label {
              font-size: 11.5px;
              color: #64748B;
              margin-bottom: 45px;
            }
            .sig-line {
              border-top: 1px solid #CBD5E1;
              padding-top: 6px;
              display: flex;
              flex-direction: column;
            }
            .sig-name {
              font-weight: 600;
              font-size: 12.5px;
              color: #18251F;
            }
            .sig-role {
              font-size: 11px;
              color: #64748B;
            }
          </style>
        </head>
        <body>
          <div class="portal-document-paper">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    }, 350);
  };

  const handleDownloadPdf = () => {
    const element = printAreaRef.current || document.getElementById('portal-document-paper-print');
    if (!element) return;

    const cleanNo = (order.nomorDokumen || order.nomor || 'DOKUMEN').replace(/[\/\\]/g, '-');
    const filename = `${(docInfo.headerTitle || 'DOKUMEN').replace(/\s+/g, '_')}_${cleanNo}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    toast.loading('Menyiapkan dan mengunduh berkas PDF...', { id: 'pdf-toast' });
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        toast.success(`Berkas ${filename} berhasil diunduh! 📄`, { id: 'pdf-toast' });
      })
      .catch((err) => {
        console.error('Gagal unduh PDF:', err);
        toast.error('Gagal mengunduh otomatis, silakan gunakan tombol Cetak.', { id: 'pdf-toast' });
      });
  };

  const dpp = Math.round(order.total / 1.11);
  const pphOrPpn = order.total - dpp;
  const subtotalBeforeTax = dpp;

  // Deteksi jenis dokumen berdasarkan title atau nomor dokumen
  const getDocTypeInfo = () => {
    const title = (order.docTitle || '').toLowerCase();
    const nomor = (order.nomor || '').toUpperCase();

    if (title.includes('po damaco') || nomor.startsWith('PO/DMC')) {
      return {
        headerTitle: 'PO DAMACO (PURCHASE ORDER)',
        validityLabel: 'Syarat Pembayaran:',
        validityValue: 'Net 14 Hari Kerja',
        refText: `Mohon cantumkan nomor referensi ${order.nomor} pada proses penagihan & pengiriman.`,
        isDraft: false,
      };
    }
    if (title.includes('po') || title.includes('purchase order') || nomor.startsWith('PO/') || nomor.startsWith('PO-')) {
      return {
        headerTitle: 'PURCHASE ORDER',
        validityLabel: 'Syarat Pembayaran:',
        validityValue: 'Net 14 Hari Kerja',
        refText: `Mohon cantumkan nomor referensi ${order.nomor} pada saat penagihan.`,
        isDraft: false,
      };
    }
    if (title.includes('invoice') || nomor.startsWith('INV/')) {
      return {
        headerTitle: 'INVOICE TAGIHAN RESMI',
        validityLabel: 'Jatuh Tempo:',
        validityValue: '14 Hari Kalender',
        refText: `Mohon cantumkan nomor invoice ${order.nomor} pada berita transfer bank.`,
        isDraft: false,
      };
    }
    if (title.includes('kwitansi') || nomor.startsWith('KW/')) {
      return {
        headerTitle: 'KWITANSI PEMBAYARAN',
        validityLabel: 'Keterangan:',
        validityValue: 'Lunas / Terverifikasi',
        refText: 'Kwitansi ini adalah bukti pembayaran yang sah diterbitkan oleh sistem PT Damaco Teknologi Presisi.',
        isDraft: false,
      };
    }
    if (title.includes('faktur pajak') || nomor.startsWith('010.')) {
      return {
        headerTitle: 'FAKTUR PAJAK',
        validityLabel: 'Masa Pajak:',
        validityValue: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        refText: 'Faktur Pajak Elektronik resmi terdaftar di Direktorat Jenderal Pajak (DJP).',
        isDraft: false,
      };
    }
    if (title.includes('surat jalan') || nomor.startsWith('SJ/')) {
      return {
        headerTitle: 'SURAT JALAN / PENGIRIMAN',
        validityLabel: 'Status Kurir:',
        validityValue: 'Damaco Secure Fleet',
        refText: 'Barang diterima dalam kondisi baik, lengkap dengan segel distributor resmi.',
        isDraft: false,
      };
    }

    // Default: Dokumen Penawaran
    const isPenawaranWaiting =
      order.actionGroup === 'terbitkan_penawaran' ||
      order.status === 'draft_penawaran' ||
      order.status === 'menunggu_penawaran' ||
      order.statusType === 'menunggu_penawaran' ||
      order.isPenawaranTerbit === false;

    if (isPenawaranWaiting) {
      return {
        headerTitle: 'PERMINTAAN PENAWARAN (RFQ)',
        validityLabel: 'Status Permintaan:',
        validityValue: 'Menunggu Persetujuan Admin',
        statusDisplay: 'Menunggu Penawaran',
        statusTheme: 'waiting',
        refText: `Dokumen ini adalah rekapan permohonan penawaran harga. Surat Penawaran Harga resmi Damaco akan terbit setelah disetujui admin.`,
        isWaitingQuotation: true,
      };
    }

    return {
      headerTitle: 'PENAWARAN HARGA',
      validityLabel: 'Berlaku Hingga:',
      validityValue: order.masaBerlaku || '14 Hari Kerja',
      statusDisplay: 'Resmi Diterbitkan',
      statusTheme: 'approved',
      refText: `Mohon cantumkan nomor referensi ${order.nomor} pada berita transfer.`,
      isWaitingQuotation: false,
    };
  };

  const docInfo = getDocTypeInfo();

  return (
    <div className="damaco-modal-backdrop" onClick={() => setIsCustomerModalOpen(false)}>
      <div className="damaco-modal-container portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Controls */}
        <div className="portal-modal-topbar">
          <div />
          <div className="portal-topbar-actions">
            <button className="portal-btn-secondary" onClick={handleDownloadPdf} title="Unduh berkas PDF">
              <FiDownload /> Unduh PDF
            </button>
            <button className="portal-btn-secondary" onClick={handlePrint} title="Cetak Dokumen">
              <FiPrinter /> Cetak
            </button>
            <button className="portal-btn-close" onClick={() => setIsCustomerModalOpen(false)} title="Tutup">
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div className="portal-document-paper" id="portal-document-paper-print" ref={printAreaRef}>
          {/* Waiting Quotation Alert Banner */}
          {docInfo.isWaitingQuotation && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#92400E',
                fontSize: '13px',
              }}
            >
              <FiAlertCircle size={22} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>Surat Penawaran Resmi Belum Diterbitkan</strong>
                <div style={{ marginTop: 2, color: '#B45309', fontSize: 12 }}>
                  Dokumen ini merupakan rekapan rincian permintaan penawaran (RFQ) yang diajukan customer. Surat Penawaran Harga resmi beserta nomor penawaran Damaco akan diterbitkan setelah Admin menerima dan memverifikasi permintaan ini.
                </div>
              </div>
            </div>
          )}

          {/* Document Header */}
          <div className="doc-header">
            <div>
              <DamacoLogo size="large" />
              <p className="doc-company-sub">PT Damaco Teknologi Presisi</p>
              <p className="doc-company-address">
                Kawasan Industri Modern Cikarang Blok C-12, Bekasi, Jawa Barat<br />
                Email: enterprise@damaco.id | Telp: (021) 8990-8800
              </p>
            </div>
            <div className="doc-quote-meta">
              <h2 className="doc-title">{docInfo.headerTitle}</h2>
              <table className="doc-meta-table">
                <tbody>
                  <tr>
                    <td>No. Dokumen:</td>
                    <td><strong>{order.nomorDokumen || order.nomor}</strong></td>
                  </tr>
                  <tr>
                    <td>Tanggal:</td>
                    <td>{order.tanggal}</td>
                  </tr>
                  <tr>
                    <td>{docInfo.validityLabel}</td>
                    <td>{docInfo.validityValue}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>
                      <span
                        className="doc-status-badge"
                        style={{
                          background: docInfo.statusTheme === 'waiting'
                            ? '#FEF3C7'
                            : docInfo.statusTheme === 'approved'
                            ? '#DCFCE7'
                            : undefined,
                          color: docInfo.statusTheme === 'waiting'
                            ? '#92400E'
                            : docInfo.statusTheme === 'approved'
                            ? '#166534'
                            : undefined,
                          borderColor: docInfo.statusTheme === 'waiting'
                            ? '#FDE68A'
                            : docInfo.statusTheme === 'approved'
                            ? '#BBF7D0'
                            : undefined,
                        }}
                      >
                        {docInfo.statusDisplay || order.statusLabel}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-divider" />

          {/* Customer & Billing Info */}
          <div className="doc-customer-section">
            <div className="customer-info-box">
              <span className="section-label">DITUJUKAN KEPADA:</span>
              <h3 className="customer-company-name">{order.customerNama}</h3>
              <p className="customer-person">Up. Divisi Pengadaan & Operasional</p>
              <p className="customer-address">
                {order.alamatPengiriman || order.alamat || 'Wilayah Operasional Indonesia | Kontak Resmi Terdaftar'}
              </p>
            </div>
            <div className="customer-info-box">
              <span className="section-label">METODE PENGIRIMAN:</span>
              <p className="delivery-spec">Damaco Direct Secure Courier + Asuransi Transit Penuh</p>
              <p className="delivery-notes">Unit lolos uji kalibrasi pra-pengiriman standard ISO 9001:2015.</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No</th>
                <th>Deskripsi Produk & Layanan</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Qty</th>
                <th style={{ textAlign: 'right', width: '160px' }}>Harga Satuan</th>
                <th style={{ textAlign: 'right', width: '160px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="item-title">{it.nama}</div>
                      <div className="item-sub">Garansi Resmi Damaco Enterprise 2 Tahun + Support Teknis 24/7</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{it.qty}</td>
                    <td style={{ textAlign: 'right' }}>Rp {it.harga.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {(it.qty * it.harga).toLocaleString('id-ID')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>1</td>
                  <td>{order.detail}</td>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td style={{ textAlign: 'right' }}>Rp {order.total.toLocaleString('id-ID')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {order.total.toLocaleString('id-ID')}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary / Calculation Box */}
          <div className="doc-summary-grid">
            <div className="payment-bank-info">
              <span className="section-label">INSTRUKSI PEMBAYARAN TRANSFER:</span>
              <div className="bank-card">
                <div>Bank: <strong>Bank Mandiri (Persero) Tbk</strong></div>
                <div>No. Rekening: <strong>123-00-9988776-5</strong></div>
                <div>Atas Nama: <strong>PT Damaco Teknologi Presisi</strong></div>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
                *{docInfo.refText}
              </p>
            </div>

            <div className="totals-calculation">
              <div className="calc-row">
                <span>Subtotal Barang (DPP):</span>
                <span>Rp {subtotalBeforeTax.toLocaleString('id-ID')}</span>
              </div>
              <div className="calc-row">
                <span>PPN 11%:</span>
                <span>Rp {pphOrPpn.toLocaleString('id-ID')}</span>
              </div>
              <div className="calc-row total-highlight">
                <span>Grand Total:</span>
                <span className="grand-total-amount">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="doc-signatures">
            <div className="sig-box">
              <p className="sig-label">
                {docInfo.isWaitingQuotation
                  ? 'Verifikator Damaco,'
                  : docInfo.headerTitle.includes('PURCHASE ORDER') || docInfo.headerTitle.includes('PO')
                  ? 'Diterbitkan Oleh,'
                  : 'Disiapkan Oleh,'}
              </p>
              <div className="sig-line">
                <span className="sig-name">
                  {docInfo.isWaitingQuotation ? '(Menunggu Persetujuan Admin)' : 'Admin Damaco'}
                </span>
                <span className="sig-role">Commercial Operations Lead</span>
              </div>
            </div>
            <div className="sig-box">
              <p className="sig-label">
                {docInfo.isWaitingQuotation
                  ? 'Diajukan Oleh Customer,'
                  : docInfo.headerTitle.includes('PURCHASE ORDER') || docInfo.headerTitle.includes('PO')
                  ? 'Diterima & Disetujui Customer,'
                  : 'Disetujui Oleh Customer,'}
              </p>
              <div className="sig-line">
                <span className="sig-name">{order.customerNama}</span>
                <span className="sig-role">
                  {docInfo.isWaitingQuotation ? 'PIC Pengadaan Customer' : 'Tanda Tangan & Cap Perusahaan'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalModal;

