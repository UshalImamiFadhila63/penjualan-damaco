import React, { useState } from 'react';
import { FiList, FiCheckCircle, FiFileText, FiCreditCard, FiTruck, FiShoppingBag, FiRotateCcw } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';

const LogAktivitasPage = () => {
  const { activityLogs, handleResetData } = useDamaco();
  const [filterType, setFilterType] = useState('all');

  const filteredLogs = activityLogs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'quote':
        return <FiFileText style={{ color: '#2563EB' }} />;
      case 'payment':
        return <FiCreditCard style={{ color: '#16A34A' }} />;
      case 'shipping':
        return <FiTruck style={{ color: '#D97706' }} />;
      case 'success':
        return <FiCheckCircle style={{ color: '#DC2626' }} />;
      default:
        return <FiShoppingBag style={{ color: '#6366F1' }} />;
    }
  };

  return (
    <div className="damaco-subpage-wrapper">
      <div className="subpage-header">
        <div>
          <h1 className="subpage-title font-serif">Log Aktivitas Sistem</h1>
          <p className="subpage-subtitle">Jejak audit otomatis seluruh langkah operasional, penerbitan quote, dan transaksi</p>
        </div>
        <button
          className="bottom-pill-btn subtle"
          onClick={handleResetData}
          title="Kembalikan riwayat awal"
        >
          <FiRotateCcw style={{ marginRight: 4 }} /> Reset Log Awal
        </button>
      </div>

      <div className="damaco-table-card">
        {/* Filter Pills */}
        <div className="table-controls-bar">
          <div className="tab-filters-row">
            <button
              className={`tab-pill-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Semua ({activityLogs.length})
            </button>
            <button
              className={`tab-pill-btn ${filterType === 'quote' ? 'active' : ''}`}
              onClick={() => setFilterType('quote')}
            >
              Penawaran
            </button>
            <button
              className={`tab-pill-btn ${filterType === 'payment' ? 'active' : ''}`}
              onClick={() => setFilterType('payment')}
            >
              Pembayaran
            </button>
            <button
              className={`tab-pill-btn ${filterType === 'shipping' ? 'active' : ''}`}
              onClick={() => setFilterType('shipping')}
            >
              Pengiriman
            </button>
          </div>
        </div>

        {/* Timeline list */}
        <div className="timeline-container">
          {filteredLogs.map(log => (
            <div key={log.id} className="timeline-item">
              <div className="timeline-icon-node">
                {getIconForType(log.type)}
              </div>
              <div className="timeline-body">
                <div className="timeline-top">
                  <span className="timeline-action">{log.action}</span>
                  <span className="timeline-time">{log.timestamp}</span>
                </div>
                <p className="timeline-detail">{log.detail}</p>
                <div className="timeline-actor">
                  Operator: <strong>{log.user}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogAktivitasPage;

