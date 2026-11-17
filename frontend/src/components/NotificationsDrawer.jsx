import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiCheck, FiBell, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';

const NotificationsDrawer = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    metrics,
    openCustomerView,
    orders,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useDamaco();

  const navigate = useNavigate();

  if (!isNotificationsOpen) return null;

  const adminNotifications = (notifications || []).filter(
    (n) => !n.targetRole || n.targetRole === 'admin'
  );

  const unreadCount = adminNotifications.filter((n) => !n.read).length;

  const handleOpenOrder = (notif) => {
    markNotificationAsRead(notif.id);
    setIsNotificationsOpen(false);
    if (notif.orderNomor) {
      const ord = orders.find((o) => o.nomor === notif.orderNomor);
      if (ord) {
        navigate(`/pesanan?id=${ord.id}`);
      }
    }
  };

  return (
    <div className="notif-drawer-backdrop" onClick={() => setIsNotificationsOpen(false)}>
      <div className="notif-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notif-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiBell className="notif-bell-icon" />
            <h3 className="notif-title">Notifikasi Sistem</h3>
            {unreadCount > 0 && (
              <span className="notif-badge-pill">{unreadCount} Baru</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#286845',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => markAllNotificationsAsRead('admin')}
              >
                Tandai dibaca
              </button>
            )}
            <button className="portal-btn-close" onClick={() => setIsNotificationsOpen(false)}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="notif-list">
          {adminNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <FiCheckCircle size={32} style={{ marginBottom: 8, color: '#286845' }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Semua notifikasi telah dibaca</p>
            </div>
          ) : (
            adminNotifications.map((item) => {
              const matchedOrder = item.orderNomor
                ? orders.find((o) => o.nomor === item.orderNomor)
                : null;

              return (
                <div
                  key={item.id}
                  className={`notif-item ${!item.read ? 'unread' : ''}`}
                  onClick={() => markNotificationAsRead(item.id)}
                  style={{
                    backgroundColor: !item.read ? '#F6FAF7' : '#FFFFFF',
                    borderLeft: !item.read ? '3px solid #286845' : '1px solid #E2E8F0',
                  }}
                >
                  <div className="notif-item-top">
                    <span className="notif-item-title" style={{ fontWeight: !item.read ? 700 : 600 }}>
                      {item.title}
                    </span>
                    <span className="notif-item-time">{item.time}</span>
                  </div>
                  <p className="notif-item-desc" style={{ color: '#475569', fontSize: 13, margin: '6px 0' }}>
                    {item.desc}
                  </p>
                  {matchedOrder && (
                    <button
                      type="button"
                      className="notif-action-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenOrder(item);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#286845',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        marginTop: 4,
                      }}
                    >
                      Buka Pesanan {matchedOrder.nomor} <FiArrowRight size={13} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="notif-footer">
          <small>{metrics.butuhTindakanCount} pesanan memerlukan respon Anda hari ini</small>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDrawer;

