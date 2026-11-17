import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiSearch,
  FiEye,
  FiPlus,
  FiCheck,
  FiChevronLeft,
  FiBriefcase,
  FiArrowRight,
  FiBell,
  FiFileText,
  FiPrinter,
  FiDownload,
  FiClock,
  FiTruck,
  FiDollarSign,
  FiShield,
} from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import toast from 'react-hot-toast';

// 10 Stepper Stages
const STEPPER_STAGES = [
  { id: 'menunggu_penawaran', label: 'Menunggu Penawaran' },
  { id: 'penawaran_terbit', label: 'Penawaran Terbit' },
  { id: 'po_diterima', label: 'PO Diterima' },
  { id: 'po_dikonfirmasi', label: 'PO Dikonfirmasi' },
  { id: 'proses_dealer', label: 'Proses Dealer' },
  { id: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
  { id: 'lunas', label: 'Lunas' },
  { id: 'dalam_pengiriman', label: 'Dalam Pengiriman' },
  { id: 'diterima', label: 'Diterima' },
  { id: 'selesai', label: 'Selesai' },
];

const getStepIndex = (order) => {
  if (!order) return 0;
  if (order.isFrozen || order.actionGroup === 'dibekukan') return 0;

  const hasPo = Boolean(order.nomorPo || order.poNumber);

  switch (order.actionGroup) {
    case 'terbitkan_penawaran': return 0;
    case 'input_po':
      // Saat baru menerbitkan penawaran dan PO belum diinput customer/admin, tetap di tahap 2: Penawaran Terbit (index 1)
      return hasPo ? 2 : 1;
    case 'urus_dealer': return 4;
    case 'buat_invoice': return 5;
    case 'tandai_lunas': return 5;
    case 'kirim_barang': return 7;
    case 'dalam_pengiriman_berjalan': return 7;
    case 'tutup_transaksi': return 8;
    case 'selesai': return 9;
    default:
      if (order.status === 'menunggu_penawaran' || order.status === 'draft_penawaran') return 0;
      if (order.status === 'penawaran_terbit') return 1;
      if (order.status === 'po_diterima') return 2;
      if (order.status === 'po_dikonfirmasi') return 3;
      if (order.status === 'proses_dealer') return 4;
      if (order.status === 'menunggu_pembayaran') return 5;
      if (order.status === 'lunas') return 6;
      if (order.status === 'dalam_pengiriman') return 7;
      if (order.status === 'diterima') return 8;
      if (order.status === 'selesai') return 9;
      return hasPo ? 2 : 1;
  }
};

const SemuaPesananPage = () => {
  const {
    orders,
    customers,
    openCustomerView,
    setIsCreateOrderModalOpen,
    setModalActionOrder,
    setActiveActionModalType,
    handleTerbitkanPenawaran,
    handleUrusDealer,
    handleTandaiLunas,
    handleKirimBarang,
    handleTutupTransaksi,
    handleTolakPesanan,
    handleIngatkanCustomer,
  } = useDamaco();

  const [searchParams, setSearchParams] = useSearchParams();

  // Default to null so the full orders table is shown first;
  // clicking any order in the table or navigating from Dashboard opens its detail view.
  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    return searchParams.get('id') || null;
  });
  const [activeDetailTab, setActiveDetailTab] = useState('ringkasan');

  useEffect(() => {
    const paramId = searchParams.get('id');
    const paramNo = searchParams.get('order');
    if (paramId) {
      setSelectedOrderId(paramId);
    } else if (paramNo) {
      const match = orders.find(o => o.nomor === paramNo);
      if (match) setSelectedOrderId(match.id);
    }
  }, [searchParams, orders]);

  useEffect(() => {
    const handleReset = () => {
      setSelectedOrderId(null);
      setActiveDetailTab('ringkasan');
      setSearchParams({});
    };
    window.addEventListener('damaco:reset-order-list', handleReset);
    return () => window.removeEventListener('damaco:reset-order-list', handleReset);
  }, [setSearchParams]);

  // List view filters
  const [activeTab, setActiveTab] = useState('semua');
  const [filterSearch, setFilterSearch] = useState('');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const orderDeliveryAddress = useMemo(() => {
    if (!selectedOrder) return '-';
    if (selectedOrder.alamatPengiriman && selectedOrder.alamatPengiriman.trim().length > 3) {
      return selectedOrder.alamatPengiriman;
    }
    if (selectedOrder.alamat && selectedOrder.alamat.trim().length > 3) {
      return selectedOrder.alamat;
    }
    const matched = (customers || []).find(c =>
      (c.email && selectedOrder.email && c.email.toLowerCase().trim() === selectedOrder.email.toLowerCase().trim()) ||
      (c.nama && selectedOrder.customerNama && c.nama.toLowerCase().trim() === selectedOrder.customerNama.toLowerCase().trim()) ||
      c.id === selectedOrder.customerId
    );
    if (matched?.alamat && matched.alamat.trim().length > 3) {
      return matched.alamat;
    }
    try {
      const email = (selectedOrder.email || '').toLowerCase().trim();
      const savedAddresses = JSON.parse(localStorage.getItem(`damaco_addresses_user_${email}`) || '[]');
      const primary = savedAddresses.find(a => a.isPrimary) || savedAddresses[0];
      if (primary?.alamat) return primary.alamat;
      const savedProfile = JSON.parse(localStorage.getItem(`damaco_profile_user_${email}`) || 'null');
      if (savedProfile?.alamat) return savedProfile.alamat;
    } catch (e) {}

    return 'Gedung Cyber 2 Tower Lt. 14, Jl. HR Rasuna Said, Jakarta Selatan';
  }, [selectedOrder, customers]);

  const tabs = [
    { id: 'semua', label: 'Semua', count: orders.length },
    {
      id: 'terbitkan_penawaran',
      label: 'Terbitkan Penawaran',
      count: orders.filter((o) => o.actionGroup === 'terbitkan_penawaran').length,
    },
    {
      id: 'input_po',
      label: 'Menunggu PO',
      count: orders.filter((o) => o.actionGroup === 'input_po').length,
    },
    {
      id: 'urus_dealer',
      label: 'Urus Dealer',
      count: orders.filter((o) => o.actionGroup === 'urus_dealer').length,
    },
    {
      id: 'buat_invoice',
      label: 'Buat Invoice',
      count: orders.filter((o) => o.actionGroup === 'buat_invoice').length,
    },
    {
      id: 'tandai_lunas',
      label: 'Tandai Lunas',
      count: orders.filter((o) => o.actionGroup === 'tandai_lunas').length,
    },
    {
      id: 'kirim_barang',
      label: 'Kirim Barang',
      count: orders.filter(
        (o) => o.actionGroup === 'kirim_barang' || o.actionGroup === 'dalam_pengiriman_berjalan'
      ).length,
    },
    {
      id: 'tutup_transaksi',
      label: 'Tutup Transaksi',
      count: orders.filter((o) => o.actionGroup === 'tutup_transaksi').length,
    },
    {
      id: 'selesai',
      label: 'Selesai',
      count: orders.filter((o) => o.actionGroup === 'selesai').length,
    },
    {
      id: 'dibekukan',
      label: 'Dibekukan',
      count: orders.filter((o) => o.actionGroup === 'dibekukan' || o.isFrozen).length,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab !== 'semua') {
      if (activeTab === 'kirim_barang') {
        if (!(order.actionGroup === 'kirim_barang' || order.actionGroup === 'dalam_pengiriman_berjalan'))
          return false;
      } else if (activeTab === 'dibekukan') {
        if (!(order.actionGroup === 'dibekukan' || order.isFrozen))
          return false;
      } else if (order.actionGroup !== activeTab) {
        return false;
      }
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const matchNo = order.nomor.toLowerCase().includes(q);
      const matchCust = order.customerNama.toLowerCase().includes(q);
      const matchItem = order.detail.toLowerCase().includes(q);
      return matchNo || matchCust || matchItem;
    }

    return true;
  });

  const triggerDialog = (order, type) => {
    setModalActionOrder(order);
    setActiveActionModalType(type);
  };

  const handlePrimaryAction = (order) => {
    if (order.isFrozen || order.actionGroup === 'dibekukan') {
      toast.error('Pesanan ini dibekukan karena akun customer telah dihapus. Transaksi tidak dapat dilanjutkan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    const hasPo = Boolean(order.nomorPo || order.poNumber);
    switch (order.actionGroup) {
      case 'terbitkan_penawaran':
        triggerDialog(order, 'terbitkan_penawaran');
        break;
      case 'input_po':
        if (!hasPo) {
          toast('Surat Penawaran telah diterbitkan. Menunggu customer mengunggah Purchase Order (PO) resmi via portal.', {
            icon: '⏳',
            duration: 800,
          });
          return;
        }
        handleUrusDealer(order.id);
        break;
      case 'urus_dealer':
        handleUrusDealer(order.id);
        break;
      case 'buat_invoice':
        triggerDialog(order, 'buat_invoice');
        break;
      case 'tandai_lunas':
        handleTandaiLunas(order.id);
        break;
      case 'kirim_barang':
        handleKirimBarang(order.id);
        break;
      case 'tutup_transaksi':
        handleTutupTransaksi(order.id);
        break;
      default:
        toast.success(`Dokumen ${order.nomor} dalam proses operasional aktif.`);
    }
  };

  const getPrimaryActionLabel = (order) => {
    if (order.isFrozen || order.actionGroup === 'dibekukan') return 'Transaksi Dibekukan 🔒';
    const hasPo = Boolean(order.nomorPo || order.poNumber);
    switch (order.actionGroup) {
      case 'terbitkan_penawaran': return 'Terbitkan penawaran';
      case 'input_po': return hasPo ? 'Urus dealer' : 'Menunggu PO Customer';
      case 'urus_dealer': return 'Koordinasi dealer';
      case 'buat_invoice': return 'Buat invoice resmi';
      case 'tandai_lunas': return 'Tandai lunas';
      case 'kirim_barang': return 'Kirim barang';
      case 'tutup_transaksi': return 'Tutup transaksi';
      case 'selesai': return 'Transaksi selesai';
      default: return 'Lanjutkan proses';
    }
  };

  /* ═════════════════════════════════════════════════════════════════════════ */
  /* DETAIL VIEW: Matches screenshot exactly, in Damaco Green Palette        */
  /* ═════════════════════════════════════════════════════════════════════════ */
  if (selectedOrder && selectedOrderId) {
    const currentStepIdx = getStepIndex(selectedOrder);

    return (
      <div className="admin-order-detail-page">
        {/* Top Breadcrumb Navigation */}
        <div className="admin-order-breadcrumb-bar">
          <button
            type="button"
            className="btn-admin-back-breadcrumb"
            onClick={() => setSelectedOrderId(null)}
            title="Kembali ke Tabel Semua Pesanan"
          >
            <FiChevronLeft size={16} />
            <span>Semua pesanan</span>
          </button>
        </div>

        {/* Order Header Block: Title, Customer, Status, Price, Primary CTA */}
        <div className="admin-order-head-banner">
          <div className="admin-order-title-group">
            <h1 className="admin-order-heading font-serif">{selectedOrder.nomor}</h1>
            <div className="admin-order-customer-subline">
              <FiBriefcase className="subline-icon" size={15} />
              <span>{selectedOrder.customerNama}</span>
            </div>
          </div>

          <div className="admin-order-header-actions-right">
            {/* Status Pill */}
            <div className="admin-order-status-pill">
              <span className="admin-status-dot" />
              <span>
                {selectedOrder.actionGroup === 'input_po' && !Boolean(selectedOrder.nomorPo || selectedOrder.poNumber)
                  ? 'Menunggu PO Customer'
                  : (selectedOrder.statusLabel || 'Menunggu Penawaran')}
              </span>
            </div>

            {/* Total Price */}
            <div className="admin-order-total-amount font-serif">
              Rp {selectedOrder.total.toLocaleString('id-ID')}
            </div>

            {/* Primary Action Button (Green Palette) */}
            {(() => {
              const hasPo = Boolean(selectedOrder.nomorPo || selectedOrder.poNumber);
              const isWaitingPo = selectedOrder.actionGroup === 'input_po' && !hasPo;
              return (
                <button
                  type="button"
                  className={`btn-admin-order-cta ${isWaitingPo ? 'waiting-po' : ''}`}
                  disabled={isWaitingPo || selectedOrder.isFrozen || selectedOrder.actionGroup === 'dibekukan'}
                  onClick={() => handlePrimaryAction(selectedOrder)}
                  style={isWaitingPo ? {
                    background: '#F1F5F9',
                    color: '#64748B',
                    borderColor: '#CBD5E1',
                    cursor: 'not-allowed',
                    opacity: 0.95,
                  } : undefined}
                  title={isWaitingPo ? 'Menunggu customer mengirimkan Purchase Order (PO) resmi via portal' : ''}
                >
                  <span>{isWaitingPo ? '⏳ Menunggu PO Customer' : getPrimaryActionLabel(selectedOrder)}</span>
                  {!isWaitingPo && <FiArrowRight size={16} />}
                </button>
              );
            })()}
          </div>
        </div>

        {/* 10-Step Horizontal Stepper Card */}
        <div className="admin-order-stepper-card">
          <div className="admin-stepper-track-wrap">
            {/* Background line */}
            <div className="admin-stepper-bg-line" />

            {/* Active green progress line */}
            <div
              className="admin-stepper-progress-line"
              style={{ width: `${(currentStepIdx / (STEPPER_STAGES.length - 1)) * 100}%` }}
            />

            {/* Stepper Nodes */}
            {STEPPER_STAGES.map((stage, idx) => {
              const isPassed = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div
                  key={stage.id}
                  className={`admin-stepper-step-node ${isCurrent ? 'current' : ''} ${isPassed ? 'completed' : ''}`}
                >
                  <div className="admin-node-circle-bubble">
                    {isPassed ? <FiCheck size={12} strokeWidth={3} /> : idx + 1}
                  </div>
                  <span className="admin-node-text-label">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Detail Tabs Bar */}
        <div className="admin-order-tabs-nav">
          <button
            type="button"
            className={`admin-detail-tab-item ${activeDetailTab === 'ringkasan' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('ringkasan')}
          >
            Ringkasan
          </button>
          <button
            type="button"
            className={`admin-detail-tab-item ${activeDetailTab === 'dokumen' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('dokumen')}
          >
            Dokumen
          </button>
          <button
            type="button"
            className={`admin-detail-tab-item ${activeDetailTab === 'pembayaran' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('pembayaran')}
          >
            Pembayaran
          </button>
          <button
            type="button"
            className={`admin-detail-tab-item ${activeDetailTab === 'pengiriman' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('pengiriman')}
          >
            Pengiriman
          </button>
          <button
            type="button"
            className={`admin-detail-tab-item ${activeDetailTab === 'riwayat' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('riwayat')}
          >
            Riwayat
          </button>
        </div>

        {/* Tab Content Display */}
        {activeDetailTab === 'ringkasan' && (
          <div className="admin-order-summary-layout">
            {/* Left Card: Barang */}
            <div className="admin-card-white admin-barang-card">
              <h2 className="admin-card-title font-serif">Barang</h2>

              <table className="admin-barang-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>BARANG</th>
                    <th style={{ textAlign: 'center' }}>QTY</th>
                    <th style={{ textAlign: 'right' }}>HARGA JUAL</th>
                    <th style={{ textAlign: 'right' }}>
                      HARGA BELI <span className="admin-mini-tag">ADMIN</span>
                    </th>
                    <th style={{ textAlign: 'right' }}>MARGIN</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      const hargaBeli = item.hargaBeli || Math.round(item.harga * 0.88);
                      const margin = item.margin || '12%';

                      return (
                        <tr key={idx}>
                          <td className="item-name-cell">{item.nama}</td>
                          <td style={{ textAlign: 'center', fontWeight: 500 }}>{item.qty}</td>
                          <td style={{ textAlign: 'right' }}>
                            Rp {item.harga.toLocaleString('id-ID')}
                          </td>
                          <td style={{ textAlign: 'right', color: '#475569' }}>
                            Rp {hargaBeli.toLocaleString('id-ID')}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#286845' }}>
                            {margin}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                        Tidak ada rincian item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="admin-barang-footer-box">
                <div className="barang-footer-row total-row">
                  <span className="total-title">Total (net)</span>
                  <span className="total-number font-serif">
                    Rp {selectedOrder.total.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="barang-footer-row margin-row">
                  <span className="margin-title">Estimasi margin kotor</span>
                  <span className="margin-number font-serif">
                    Rp {(selectedOrder.estimasiMarginKotor || Math.round(selectedOrder.total * 0.12)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Customer & Aksi Lain */}
            <div className="admin-side-cards-col">
              {/* Card Customer */}
              <div className="admin-card-white admin-customer-card">
                <h2 className="admin-card-title font-serif">Customer</h2>

                <div className="admin-customer-info-body">
                  <strong className="customer-org-name">{selectedOrder.customerNama}</strong>
                  <div className="customer-meta-line">
                    {selectedOrder.contact || 'PIC Customer'}{selectedOrder.telepon ? ` - ${selectedOrder.telepon}` : ''}
                  </div>
                  <div className="customer-meta-line">{selectedOrder.email || '-'}</div>
                  <div className="customer-meta-line">{selectedOrder.npwp ? `NPWP ${selectedOrder.npwp}` : 'NPWP Terlampir'}</div>
                </div>
              </div>

              {/* Card Aksi Lain */}
              <div className="admin-card-white admin-aksi-lain-card">
                <h2 className="admin-card-title font-serif">Aksi lain</h2>

                <div className="admin-aksi-buttons-cluster">
                  <button
                    type="button"
                    className="btn-admin-action-pill"
                    onClick={() => setActiveDetailTab('dokumen')}
                    title="Buka menu Dokumen transaksi"
                  >
                    Dokumen
                  </button>

                  <button
                    type="button"
                    className="btn-admin-action-pill"
                    onClick={() => handleIngatkanCustomer(selectedOrder.id)}
                    title="Kirim pengingat follow-up ke customer"
                  >
                    <FiBell size={13} />
                    <span>Ingatkan customer</span>
                  </button>

                  <button
                    type="button"
                    className="btn-admin-action-pill tolak"
                    onClick={() => handleTolakPesanan(selectedOrder.id)}
                    title="Tolak pesanan ini"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Dokumen */}
        {activeDetailTab === 'dokumen' && (
          <div className="admin-card-white" style={{ padding: '24px' }}>
            <h2 className="admin-card-title font-serif" style={{ marginBottom: 16 }}>
              Berkas & Dokumen Transaksi ({selectedOrder.nomor})
            </h2>
            <div className="admin-docs-list-grid">
              {/* 1. Surat Penawaran Harga */}
              <div className="admin-doc-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiFileText size={20} color={getStepIndex(selectedOrder) >= 1 ? '#286845' : '#94A3B8'} />
                  <div>
                    <strong>Surat Penawaran Harga (Quotation)</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {getStepIndex(selectedOrder) >= 1
                        ? `Nomor: ${selectedOrder.nomorPenawaran || selectedOrder.nomor}`
                        : 'Belum diterbitkan (Klik tombol "Terbitkan penawaran" di atas)'}
                    </div>
                  </div>
                </div>
                {getStepIndex(selectedOrder) >= 1 ? (
                  <button
                    type="button"
                    className="btn-admin-action-pill"
                    onClick={() => openCustomerView({
                      ...selectedOrder,
                      docTitle: 'Surat Penawaran Harga',
                      docType: 'penawaran',
                      nomorDokumen: selectedOrder.nomorPenawaran || selectedOrder.nomor,
                    })}
                  >
                    <FiEye size={13} /> Lihat Penawaran
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: '#64748B',
                      background: '#F1F5F9',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Surat penawaran harga resmi belum diterbitkan admin"
                  >
                    🔒 Belum Terbit
                  </span>
                )}
              </div>

              {/* 2. Purchase Order Resmi (Customer) */}
              {(() => {
                const hasPo = Boolean(selectedOrder.nomorPo || selectedOrder.poNumber);
                const poNumberDisplay = selectedOrder.nomorPo || selectedOrder.poNumber;
                return (
                  <div className="admin-doc-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FiFileText size={20} color={hasPo ? '#286845' : '#94A3B8'} />
                      <div>
                        <strong>Purchase Order Resmi (Customer)</strong>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          Nomor: {hasPo ? poNumberDisplay : 'Belum diunggah customer'}
                        </div>
                      </div>
                    </div>
                    {hasPo ? (
                      <button
                        type="button"
                        className="btn-admin-action-pill"
                        onClick={() => openCustomerView({
                          ...selectedOrder,
                          docTitle: 'Purchase Order',
                          docType: 'po_resmi',
                          nomorDokumen: poNumberDisplay,
                        })}
                      >
                        <FiEye size={13} /> Tinjau PO
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: '#64748B',
                          background: '#F1F5F9',
                          padding: '5px 12px',
                          borderRadius: 6,
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title="Customer belum mengunggah atau menginput nomor PO"
                      >
                        🔒 Belum Diunggah
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 3. PO Damaco */}
              <div className="admin-doc-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiFileText size={20} color={getStepIndex(selectedOrder) >= 3 ? '#286845' : '#94A3B8'} />
                  <div>
                    <strong>PO Damaco (Internal & Dealer)</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Nomor: {getStepIndex(selectedOrder) >= 3 ? (selectedOrder.poDamacoNomor || `PO/DMC/${selectedOrder.nomor.slice(3)}`) : 'Terbit setelah PO dikonfirmasi'}
                    </div>
                  </div>
                </div>
                {getStepIndex(selectedOrder) >= 3 ? (
                  <button
                    type="button"
                    className="btn-admin-action-pill"
                    onClick={() => openCustomerView({
                      ...selectedOrder,
                      docTitle: 'PO Damaco (Purchase Order)',
                      docType: 'po',
                      nomorDokumen: selectedOrder.poDamacoNomor || `PO/DMC/${selectedOrder.nomor.slice(3)}`,
                    })}
                  >
                    <FiEye size={13} /> Lihat PO Damaco
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: '#64748B',
                      background: '#F1F5F9',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    🔒 Belum Terbit
                  </span>
                )}
              </div>

              {/* 4. Invoice Tagihan Resmi */}
              <div className="admin-doc-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiFileText size={20} color={getStepIndex(selectedOrder) >= 5 ? '#286845' : '#94A3B8'} />
                  <div>
                    <strong>Invoice Tagihan Resmi</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Nomor: {selectedOrder.invoiceNomor || (getStepIndex(selectedOrder) >= 5 ? `INV/${selectedOrder.nomor.slice(3)}` : 'Terbit setelah verifikasi Dealer')}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-admin-action-pill"
                  disabled={getStepIndex(selectedOrder) < 5}
                  style={{ opacity: getStepIndex(selectedOrder) < 5 ? 0.5 : 1 }}
                  onClick={() => openCustomerView({
                    ...selectedOrder,
                    docTitle: 'Invoice Tagihan Resmi',
                    docType: 'invoice',
                    nomorDokumen: selectedOrder.invoiceNomor || `INV/${selectedOrder.nomor.slice(3)}`,
                  })}
                >
                  <FiEye size={13} /> Lihat Invoice
                </button>
              </div>

              {/* 5. Kwitansi Pembayaran */}
              <div className="admin-doc-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiFileText size={20} color={getStepIndex(selectedOrder) >= 6 ? '#286845' : '#94A3B8'} />
                  <div>
                    <strong>Kwitansi Pembayaran</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Nomor: {getStepIndex(selectedOrder) >= 6 ? `KW/${selectedOrder.nomor.slice(3)}` : 'Terbit setelah pembayaran lunas'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-admin-action-pill"
                  disabled={getStepIndex(selectedOrder) < 6}
                  style={{ opacity: getStepIndex(selectedOrder) < 6 ? 0.5 : 1 }}
                  onClick={() => openCustomerView({
                    ...selectedOrder,
                    docTitle: 'Kwitansi Pembayaran',
                    docType: 'kwitansi',
                    nomorDokumen: `KW/${selectedOrder.nomor.slice(3)}`,
                  })}
                >
                  <FiEye size={13} /> Cetak Kwitansi
                </button>
              </div>

              {/* 6. Faktur Pajak Elektronik */}
              <div className="admin-doc-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiFileText size={20} color={getStepIndex(selectedOrder) >= 6 ? '#286845' : '#94A3B8'} />
                  <div>
                    <strong>Faktur Pajak Elektronik (e-Faktur DJP)</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Nomor: {getStepIndex(selectedOrder) >= 6 ? `010.000-26.${(selectedOrder.nomor.replace(/[^0-9]/g, '').slice(-8) || '20260001')}` : 'Terbit bersamaan dengan pelunasan'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-admin-action-pill"
                  disabled={getStepIndex(selectedOrder) < 6}
                  style={{ opacity: getStepIndex(selectedOrder) < 6 ? 0.5 : 1 }}
                  onClick={() => openCustomerView({
                    ...selectedOrder,
                    docTitle: 'Faktur Pajak',
                    docType: 'faktur_pajak',
                    nomorDokumen: `010.000-26.${(selectedOrder.nomor.replace(/[^0-9]/g, '').slice(-8) || '20260001')}`,
                  })}
                >
                  <FiEye size={13} /> Cetak Faktur
                </button>
              </div>

              {/* 7. Surat Jalan / Pengiriman */}
              <div className="admin-doc-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiFileText size={20} color={getStepIndex(selectedOrder) >= 7 ? '#286845' : '#94A3B8'} />
                  <div>
                    <strong>Surat Jalan / Bukti Ekspedisi</strong>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {selectedOrder.noResi ? `No. Resi: ${selectedOrder.noResi}` : (getStepIndex(selectedOrder) >= 7 ? `SJ/${selectedOrder.nomor.slice(3)}` : 'Terbit saat pengiriman barang')}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-admin-action-pill"
                  disabled={getStepIndex(selectedOrder) < 7}
                  style={{ opacity: getStepIndex(selectedOrder) < 7 ? 0.5 : 1 }}
                  onClick={() => openCustomerView({
                    ...selectedOrder,
                    docTitle: 'Surat Jalan / Pengiriman',
                    docType: 'surat_jalan',
                    nomorDokumen: selectedOrder.noResi || `SJ/${selectedOrder.nomor.slice(3)}`,
                  })}
                >
                  <FiEye size={13} /> Surat Jalan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Pembayaran */}
        {activeDetailTab === 'pembayaran' && (
          <div className="admin-card-white" style={{ padding: '24px' }}>
            <h2 className="admin-card-title font-serif" style={{ marginBottom: 16 }}>
              Status & Verifikasi Pembayaran
            </h2>
            <div className="admin-dealer-details-box">
              <div className="dealer-grid-2">
                <div>
                  <span className="dealer-field-label">Rekening Penerima:</span>
                  <strong>Bank Mandiri (123-00-9876543-2 a.n. PT Damaco Teknologi Presisi)</strong>
                </div>
                <div>
                  <span className="dealer-field-label">Total Tagihan:</span>
                  <strong style={{ fontSize: 18, color: '#286845' }}>
                    Rp {selectedOrder.total.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div>
                  <span className="dealer-field-label">Termin Pembayaran:</span>
                  <span>Net 14 Hari Kalender / SP2D Instansi</span>
                </div>
                <div>
                  <span className="dealer-field-label">Status Finance:</span>
                  <span>{selectedOrder.statusLabel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Pengiriman */}
        {activeDetailTab === 'pengiriman' && (
          <div className="admin-card-white" style={{ padding: '24px' }}>
            <h2 className="admin-card-title font-serif" style={{ marginBottom: 16 }}>
              Logistik & Pengiriman Unit
            </h2>
            <div className="admin-dealer-details-box">
              <div className="dealer-grid-2">
                <div>
                  <span className="dealer-field-label">Ekspedisi:</span>
                  <strong>{selectedOrder.ekspedisi || 'Damaco Secure Fleet (Driver: Pak Joko - 0812-9988-1122)'}</strong>
                </div>
                <div>
                  <span className="dealer-field-label">Nomor Resi:</span>
                  <code>{selectedOrder.noResi || selectedOrder.resi || 'DMC-EXP-20261111-21'}</code>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="dealer-field-label">Alamat Kirim:</span>
                  <span style={{ fontWeight: 500, color: '#18251F' }}>{orderDeliveryAddress}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Riwayat */}
        {activeDetailTab === 'riwayat' && (
          <div className="admin-card-white" style={{ padding: '24px' }}>
            <h2 className="admin-card-title font-serif" style={{ marginBottom: 16 }}>
              Riwayat Aktivitas Pesanan ({selectedOrder.nomor})
            </h2>
            <div className="admin-audit-trail-list">
              <div className="audit-trail-item">
                <span className="audit-dot" />
                <div>
                  <strong>Draft Penawaran Dibuat</strong>
                  <div style={{ fontSize: 12, color: '#64748B' }}>11 Nov 2026, 11:30 WIB • Sistem Katalog B2B</div>
                </div>
              </div>
              <div className="audit-trail-item">
                <span className="audit-dot" />
                <div>
                  <strong>Permintaan Masuk dari Pelanggan</strong>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {selectedOrder.tanggal || '11 Nov 2026'}, 09:15 WIB • {selectedOrder.contact || 'PIC Customer'} ({selectedOrder.customerNama || 'Instansi B2B'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═════════════════════════════════════════════════════════════════════════ */
  /* LIST VIEW: Table of all orders                                            */
  /* ═════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="damaco-subpage-wrapper">
      {/* Page Title & Action */}
      <div className="subpage-header">
        <div>
          <h1 className="subpage-title font-serif">Semua Pesanan</h1>
          <p className="subpage-subtitle">
            Kelola seluruh riwayat transaksi, quotation, dan pipeline operasional Damaco
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="damaco-table-card">
        <div className="table-controls-bar">
          <div className="tab-filters-row">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`tab-pill-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label} <span className="tab-pill-count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="table-search-box">
            <FiSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Cari nomor pesanan, customer..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-scroll-container">
          <table className="damaco-data-table">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Rincian Produk</th>
                <th style={{ textAlign: 'right' }}>Total Nilai</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right', width: 180, minWidth: 180 }}>Aksi Langkah</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    Tidak ada pesanan ditemukan pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span
                        className="clickable-code"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(order.id);
                        }}
                        title="Klik untuk membuka detail pesanan"
                      >
                        {order.nomor}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: 13 }}>{order.tanggal}</td>
                    <td>
                      <strong>{order.customerNama}</strong>
                    </td>
                    <td style={{ color: '#475569', fontSize: 13 }}>{order.detail}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-pill ${order.actionGroup}`}>
                        {order.statusLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', width: 180, minWidth: 180 }}>
                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn-icon-table"
                          onClick={() => setSelectedOrderId(order.id)}
                          title="Buka rincian lengkap pesanan"
                        >
                          <FiEye />
                        </button>

                        {(order.actionGroup === 'dibekukan' || order.isFrozen) && (
                          <span
                            style={{
                              fontSize: 11.5,
                              color: '#94A3B8',
                              background: '#F1F5F9',
                              padding: '5px 10px',
                              borderRadius: 999,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Akun customer telah dihapus. Transaksi dibekukan permanen."
                          >
                            🔒 Dibekukan
                          </span>
                        )}

                        {order.actionGroup === 'terbitkan_penawaran' && !order.isFrozen && (
                          <button
                            className="btn-table-action"
                            onClick={() => triggerDialog(order, 'terbitkan_penawaran')}
                          >
                            Terbitkan →
                          </button>
                        )}

                        {order.actionGroup === 'input_po' && !order.isFrozen && (
                          (() => {
                            const hasPo = Boolean(order.nomorPo || order.poNumber);
                            if (!hasPo) {
                              return (
                                <span
                                  style={{
                                    fontSize: 11.5,
                                    color: '#D97706',
                                    background: '#FEF3C7',
                                    padding: '5px 10px',
                                    borderRadius: 999,
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                  title="Menunggu customer mengirimkan nomor PO via portal"
                                >
                                  ⏳ Menunggu PO
                                </span>
                              );
                            }
                            return (
                              <button
                                className="btn-table-action"
                                onClick={() => handleUrusDealer(order.id)}
                              >
                                Urus Dealer →
                              </button>
                            );
                          })()
                        )}

                        {order.actionGroup === 'urus_dealer' && !order.isFrozen && (
                          <button
                            className="btn-table-action"
                            onClick={() => handleUrusDealer(order.id)}
                          >
                            Urus Dealer →
                          </button>
                        )}

                        {order.actionGroup === 'buat_invoice' && !order.isFrozen && (
                          <button
                            className="btn-table-action"
                            onClick={() => triggerDialog(order, 'buat_invoice')}
                          >
                            Buat Invoice →
                          </button>
                        )}

                        {order.actionGroup === 'tandai_lunas' && !order.isFrozen && (
                          <button
                            className="btn-table-action"
                            onClick={() => handleTandaiLunas(order.id)}
                          >
                            Tandai Lunas →
                          </button>
                        )}

                        {order.actionGroup === 'kirim_barang' && !order.isFrozen && (
                          <button
                            className="btn-table-action"
                            onClick={() => handleKirimBarang(order.id)}
                          >
                            Kirim →
                          </button>
                        )}

                        {order.actionGroup === 'tutup_transaksi' && !order.isFrozen && (
                          <button
                            className="btn-table-action"
                            onClick={() => handleTutupTransaksi(order.id)}
                          >
                            Tutup →
                          </button>
                        )}

                        {order.actionGroup === 'selesai' && !order.isFrozen && (
                          <span
                            style={{
                              fontSize: 12,
                              color: '#16A34A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <FiCheck /> Selesai
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SemuaPesananPage;
