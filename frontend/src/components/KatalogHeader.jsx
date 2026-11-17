import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiFileText, FiUser, FiX, FiCheckCircle, FiShield, FiArrowRight, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DamacoLogo from './DamacoLogo';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';

const KatalogHeader = () => {
  const {
    orders,
    permintaanCart,
    setIsCartOpen,
    setIsPesananSayaOpen,
    setIsProfilPerusahaanOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    mapOrderToCustomerView,
    customerUnreadOrderIds,
    markCustomerOrdersAsRead,
  } = useDamaco();

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cartTotalItems = permintaanCart.reduce((sum, item) => sum + item.qty, 0);

  const customerNotifications = useMemo(() => {
    if (!user) return [];
    const userEmail = (user.email || '').toLowerCase().trim();
    const isDemoCust = userEmail === 'customer@damaco.com' || userEmail === 'raka@nusantarageo.co.id';

    return (notifications || []).filter((n) => {
      if (n.targetRole !== 'customer') return false;
      // Jika notifikasi memiliki targetEmail, hanya tampilkan jika email cocok dengan user yang sedang login
      if (n.targetEmail) {
        return n.targetEmail.toLowerCase().trim() === userEmail;
      }
      // Notifikasi umum tanpa targetEmail / target spesifik hanya untuk demo customer bawaan
      return isDemoCust;
    });
  }, [notifications, user]);

  const customerUnreadCount = customerNotifications.filter((n) => !n.read).length;

  const customerTindakanCount = useMemo(() => {
    if (!user) return 0;
    const userEmail = (user.email || '').toLowerCase().trim();
    const isDemoCust = userEmail === 'customer@damaco.com' || userEmail === 'raka@nusantarageo.co.id';

    const customerOrders = (orders || []).filter((o) => {
      if (user?.role === 'admin') return true;
      const orderEmail = (o.email || '').toLowerCase().trim();

      // Demo customer
      if (isDemoCust) {
        const comp = (o.customerNama || '').toLowerCase().trim();
        return orderEmail === 'customer@damaco.com' || orderEmail === 'raka@nusantarageo.co.id' || comp.includes('nusantara geospasial');
      }

      // Akun customer baru/terdaftar: HANYA jika email pesanan sama persis dengan email user!
      return Boolean(orderEmail && userEmail && orderEmail === userEmail);
    });

    const tindakanOrders = customerOrders.map(mapOrderToCustomerView).filter((o) => o && o.isGiliranAnda);
    const unreadOrders = customerOrders.filter(co => (customerUnreadOrderIds || []).includes(co.nomor) || (customerUnreadOrderIds || []).includes(co.id));

    // Gabungkan order yang perlu tindakan atau unread agar tidak terhitung dobel
    const badgeOrderKeys = new Set([
      ...tindakanOrders.map(o => o.nomor || o.id),
      ...unreadOrders.map(o => o.nomor || o.id)
    ]);

    return badgeOrderKeys.size;
  }, [orders, user, mapOrderToCustomerView, customerUnreadOrderIds]);

  return (
    <header className="katalog-navbar">
      <div className="katalog-nav-container">
        {/* Left: Brand Logo */}
        <div className="katalog-brand-group">
          <NavLink to="/katalog" className="katalog-logo-link">
            <DamacoLogo size="medium" />
          </NavLink>
        </div>

        {/* Center: Navigation Links */}
        <nav className="katalog-nav-links">
          <NavLink
            to="/katalog"
            className={({ isActive }) => `katalog-nav-item ${isActive ? 'active' : ''}`}
          >
            Katalog
          </NavLink>

          <NavLink
            to="/pesanan-saya"
            className={({ isActive }) => `katalog-nav-item ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              markCustomerOrdersAsRead();
              if (!user) {
                e.preventDefault();
                toast('Silakan masuk untuk melihat Pesanan Saya', { icon: '🔒' });
                navigate('/login');
              }
            }}
          >
            <span>Pesanan Saya</span>
            {user && customerTindakanCount > 0 && (
              <span className="katalog-nav-action-badge">{customerTindakanCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/profil-perusahaan"
            className={({ isActive }) => `katalog-nav-item ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                toast('Silakan masuk untuk melihat Profil Perusahaan', { icon: '🔒' });
                navigate('/login');
              }
            }}
          >
            Profil perusahaan
          </NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="katalog-nav-actions">
          {/* Search Trigger */}
          <div className="search-trigger-wrap" style={{ position: 'relative' }}>
            <button
              type="button"
              className="katalog-round-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Cari drone, suku cadang, atau paket"
            >
              <FiSearch size={17} />
            </button>

            {/* Live Search Modal / Flyout */}
            {isSearchOpen && (
              <div className="katalog-search-flyout">
                <div className="flyout-search-bar">
                  <FiSearch className="flyout-icon" />
                  <input
                    type="text"
                    placeholder="Ketik nama produk, tipe, keperluan (misal: Atlas, RTK, Agri)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button className="flyout-close" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                    <FiX />
                  </button>
                </div>

                {searchResults && searchQuery.trim() && (
                  <div className="flyout-results-list">
                    <div className="flyout-section-title">
                      Hasil Pencarian ({searchResults.products.length} produk ditemukan)
                    </div>
                    {searchResults.products.length === 0 ? (
                      <div className="flyout-empty">Tidak ada produk cocok dengan "{searchQuery}"</div>
                    ) : (
                      searchResults.products.slice(0, 5).map(prod => (
                        <div
                          key={prod.id}
                          className="flyout-item"
                          onClick={() => {
                            navigate(`/katalog?product=${prod.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <div>
                            <div className="flyout-item-name">{prod.nama}</div>
                            <div className="flyout-item-meta">{prod.brand} • {prod.kategori}</div>
                          </div>
                          <div className="flyout-item-price">Rp {prod.harga.toLocaleString('id-ID')}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification Bell with Dynamic Badge */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="katalog-round-btn"
              onClick={() => {
                if (!user) {
                  toast('Silakan masuk untuk melihat notifikasi', { icon: '🔒' });
                  navigate('/login');
                  return;
                }
                setIsNotifOpen(!isNotifOpen);
              }}
              title="Notifikasi Sistem"
            >
              <FiBell size={17} />
              {user && customerUnreadCount > 0 && (
                <span className="katalog-badge-counter">{customerUnreadCount}</span>
              )}
            </button>

            {/* Notification Drawer (Matched with Admin Sidebar Notif Drawer) */}
            {isNotifOpen && (
              <div className="notif-drawer-backdrop" onClick={() => setIsNotifOpen(false)}>
                <div className="notif-drawer-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="notif-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiBell className="notif-bell-icon" style={{ color: '#286845' }} />
                      <h3 className="notif-title">Notifikasi Sistem</h3>
                      {customerUnreadCount > 0 && (
                        <span className="notif-badge-pill" style={{ background: '#E8F5E9', color: '#286845' }}>
                          {customerUnreadCount} Baru
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {customerUnreadCount > 0 && (
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
                          onClick={() => markAllNotificationsAsRead('customer')}
                        >
                          Tandai dibaca
                        </button>
                      )}
                      <button className="portal-btn-close" onClick={() => setIsNotifOpen(false)}>
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="notif-list">
                    {customerNotifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                        <FiCheckCircle size={36} style={{ marginBottom: 12, color: '#286845' }} />
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Semua notifikasi telah dibaca</p>
                      </div>
                    ) : (
                      customerNotifications.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className={`notif-item ${!item.read ? 'unread' : ''}`}
                            onClick={() => {
                              markNotificationAsRead(item.id);
                              if (item.orderNomor) {
                                setIsNotifOpen(false);
                                navigate(`/pesanan-saya?order=${item.orderNomor}`);
                              }
                            }}
                            style={{
                              backgroundColor: !item.read ? '#F6FAF7' : '#FFFFFF',
                              borderLeft: !item.read ? '3px solid #286845' : '1px solid #E2E8F0',
                              cursor: item.orderNomor ? 'pointer' : 'default',
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
                            {item.orderNomor && (
                              <button
                                type="button"
                                className="notif-action-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(item.id);
                                  setIsNotifOpen(false);
                                  navigate(`/pesanan-saya?order=${item.orderNomor}`);
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
                                Buka Pesanan {item.orderNomor} <FiArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="notif-footer">
                    <small>
                      {customerTindakanCount > 0
                        ? `${customerTindakanCount} pesanan memerlukan respon Anda hari ini`
                        : 'Tidak ada pesanan tertunda'}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Permintaan (Quotation Cart) Button with Badge */}
          <button
            type="button"
            className="katalog-permintaan-btn"
            onClick={() => setIsCartOpen(true)}
            title="Daftar Permintaan Penawaran Harga"
          >
            <FiFileText size={16} />
            <span>Permintaan</span>
            {cartTotalItems > 0 && (
              <span className="permintaan-count-pill">{cartTotalItems}</span>
            )}
          </button>

          {/* User Profile Pill & Dropdown (When Logged In) OR Masuk/Daftar Button (When Guest) */}
          {user ? (
            <div
              className="damaco-profile-wrapper"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div
                className="damaco-avatar"
                style={{
                  backgroundColor: user?.role === 'admin' ? '#286845' : '#1E5034',
                  color: '#FFFFFF',
                }}
              >
                {user?.nama ? (
                  user.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                ) : (
                  'RP'
                )}
              </div>
              <div className="damaco-profile-text">
                <span className="damaco-user-name">{user?.nama || 'Pengguna'}</span>
                <span className="damaco-user-role">
                  {user?.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="damaco-profile-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-user-header">
                    <strong>{user?.nama || 'Raka Pradipta'}</strong>
                    <small>{user?.email || 'customer@damaco.com'}</small>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item logout"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    Keluar dari Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="katalog-auth-btn"
              onClick={() => navigate('/login')}
              title="Masuk atau Daftar Akun B2B Damaco"
            >
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default KatalogHeader;

