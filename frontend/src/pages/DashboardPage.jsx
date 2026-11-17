import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCalendar,
  FiTruck,
  FiBarChart2,
  FiPlus,
  FiRotateCcw,
} from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const {
    metrics,
    handleTerbitkanPenawaran,
    handleUrusDealer,
    handleTandaiLunas,
    handleKirimBarang,
    handleTutupTransaksi,
    setModalActionOrder,
    setActiveActionModalType,
    setIsCreateOrderModalOpen,
    handleResetData,
    orders,
    customers,
  } = useDamaco();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Navigate directly to order detail view in Semua Pesanan
  const handleOpenOrderDetail = (order) => {
    navigate(`/pesanan?id=${order.id}`);
  };

  // First name greeting
  const firstName = user?.nama ? user.nama.split(' ')[0] : 'Admin';

  const {
    terbitkanPenawaranList,
    inputPoList,
    urusDealerList,
    buatInvoiceList,
    tandaiLunasList,
    kirimBarangList,
    tutupTransaksiList,
  } = metrics.groups;

  // Open workflow dialog for PO, Dealer, Invoice
  const triggerWorkflowDialog = (order, type) => {
    if (order.isFrozen || order.actionGroup === 'dibekukan') {
      toast.error('Pesanan ini dibekukan karena akun customer telah dihapus. Transaksi tidak dapat dilanjutkan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    setModalActionOrder(order);
    setActiveActionModalType(type);
  };

  return (
    <div className="damaco-dashboard-wrapper">
      {/* Date Header */}
      <div className="damaco-date-badge">
        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
      </div>

      {/* Hero Greeting */}
      <h1 className="damaco-hero-greeting font-serif">Selamat pagi, {firstName}.</h1>
      <p className="damaco-hero-subtitle">
        {metrics.butuhTindakanCount} pesanan menunggu langkah dari Anda hari ini.
      </p>

      {/* 4 Stat Metric Cards */}
      <div className="damaco-stats-grid">
        {/* Card 1: Butuh tindakan */}
        <div className="damaco-stat-card card-action-alert">
          <div className="stat-card-header">
            <span className="stat-label">Butuh tindakan</span>
            <FiBell className="stat-icon-top" style={{ color: '#286845' }} />
          </div>
          <div className="stat-value-huge alert-red">{metrics.butuhTindakanCount}</div>
        </div>

        {/* Card 2: Menunggu pembayaran */}
        <div className="damaco-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Menunggu pembayaran</span>
            <FiCalendar className="stat-icon-top" />
          </div>
          <div className="stat-value-huge">{metrics.menungguBayarCount}</div>
          <div className="stat-subtext">Rp {metrics.menungguBayarTotal.toLocaleString('id-ID')}</div>
        </div>

        {/* Card 3: Dalam pengiriman */}
        <div className="damaco-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Dalam pengiriman</span>
            <FiTruck className="stat-icon-top" />
          </div>
          <div className="stat-value-huge">{metrics.pengirimanCount}</div>
        </div>

        {/* Card 4: Nilai pipeline aktif */}
        <div className="damaco-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Nilai pipeline aktif</span>
            <FiBarChart2 className="stat-icon-top" />
          </div>
          <div className="stat-value-currency font-serif">
            Rp {metrics.pipelineTotal.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Section: Butuh tindakan Anda */}
      <h2 className="damaco-section-title font-serif">Butuh tindakan Anda</h2>

      {/* 1. Group: Terbitkan penawaran */}
      {terbitkanPenawaranList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Terbitkan penawaran</span>
            <span className="group-badge-count">{terbitkanPenawaranList.length}</span>
          </div>
          <div className="group-rows-list">
            {terbitkanPenawaranList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="damaco-action-btn"
                    onClick={() => triggerWorkflowDialog(order, 'terbitkan_penawaran')}
                  >
                    Terbitkan penawaran →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Group: Menunggu PO Customer */}
      {inputPoList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Menunggu PO Customer</span>
            <span className="group-badge-count">{inputPoList.length}</span>
          </div>
          <div className="group-rows-list">
            {inputPoList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#D97706',
                      background: '#FEF3C7',
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Menunggu customer mengirimkan nomor PO resmi via portal"
                  >
                    ⏳ Menunggu PO
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Group: Urus dealer */}
      {urusDealerList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Urus dealer</span>
            <span className="group-badge-count">{urusDealerList.length}</span>
          </div>
          <div className="group-rows-list">
            {urusDealerList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="damaco-action-btn"
                    onClick={() => handleUrusDealer(order.id)}
                  >
                    Urus dealer →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Group: Buat invoice */}
      {buatInvoiceList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Buat invoice</span>
            <span className="group-badge-count">{buatInvoiceList.length}</span>
          </div>
          <div className="group-rows-list">
            {buatInvoiceList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="damaco-action-btn"
                    onClick={() => triggerWorkflowDialog(order, 'buat_invoice')}
                  >
                    Buat invoice →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Group: Tandai Lunas */}
      {tandaiLunasList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Tandai Lunas</span>
            <span className="group-badge-count">{tandaiLunasList.length}</span>
          </div>
          <div className="group-rows-list">
            {tandaiLunasList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="damaco-action-btn"
                    onClick={() => handleTandaiLunas(order.id)}
                  >
                    Tandai Lunas →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Group: Kirim barang */}
      {kirimBarangList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Kirim barang</span>
            <span className="group-badge-count">{kirimBarangList.length}</span>
          </div>
          <div className="group-rows-list">
            {kirimBarangList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="damaco-action-btn"
                    onClick={() => handleKirimBarang(order.id)}
                  >
                    Kirim barang →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Group: Tutup transaksi */}
      {tutupTransaksiList.length > 0 && (
        <div className="damaco-action-group-card">
          <div className="group-card-header">
            <span className="group-title">Tutup transaksi</span>
            <span className="group-badge-count">{tutupTransaksiList.length}</span>
          </div>
          <div className="group-rows-list">
            {tutupTransaksiList.map((order) => (
              <div key={order.id} className="action-row" onClick={() => handleOpenOrderDetail(order)} style={{ cursor: 'pointer' }}>
                <div
                  className="order-code-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  {order.nomor}
                </div>
                <div
                  className="order-customer-col"
                  title="Klik untuk melihat detail rincian pesanan"
                >
                  <div className="customer-name">{order.customerNama}</div>
                  <div className="customer-items-sub">{order.detail}</div>
                </div>
                <div className="order-price-col">
                  Rp {order.total.toLocaleString('id-ID')}
                </div>
                <div className="order-btn-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="damaco-action-btn"
                    onClick={() => handleTutupTransaksi(order.id)}
                  >
                    Tutup transaksi →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
