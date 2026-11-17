import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiX } from 'react-icons/fi';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    metrics,
    openCustomerView,
    setIsNotificationsOpen,
    isNotificationsOpen,
    notifications,
  } = useDamaco();

  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const adminUnreadCount = (notifications || []).filter(
    (n) => (!n.targetRole || n.targetRole === 'admin') && !n.read
  ).length;

  return (
    <header className="damaco-topbar">
      {/* Search Input Bar */}
      <div className="damaco-search-container">
        <FiSearch className="damaco-search-icon" />
        <input
          type="text"
          className="damaco-search-input"
          placeholder="Cari pesanan, customer, produk"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="damaco-search-clear"
            onClick={() => setSearchQuery('')}
            title="Hapus pencarian"
          >
            <FiX />
          </button>
        )}

        {/* Live Search Popup Dropdown */}
        {searchResults && searchQuery.trim() && (
          <div className="damaco-search-dropdown">
            <div className="search-dropdown-header">
              <span>Hasil Pencarian ({searchResults.totalCount})</span>
              <button onClick={() => setSearchQuery('')} className="search-close-btn">
                Tutup
              </button>
            </div>

            {searchResults.totalCount === 0 ? (
              <div className="search-empty">Tidak ada data ditemukan untuk "{searchQuery}"</div>
            ) : (
              <div className="search-results-list">
                {/* Orders */}
                {searchResults.orders.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">Pesanan ({searchResults.orders.length})</div>
                    {searchResults.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="search-item"
                        onClick={() => {
                          navigate(`/pesanan?id=${ord.id}`);
                          setSearchQuery('');
                        }}
                      >
                        <div className="search-item-primary">
                          <span className="search-badge-code">{ord.nomor}</span>
                          <span className="search-name">{ord.customerNama}</span>
                        </div>
                        <div className="search-item-secondary">
                          <span>{ord.detail}</span>
                          <span className="search-price">Rp {ord.total.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {searchResults.customers.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">Customer ({searchResults.customers.length})</div>
                    {searchResults.customers.map((c) => (
                      <div key={c.id} className="search-item">
                        <div className="search-item-primary">
                          <span className="search-name">{c.nama}</span>
                          <span className="search-meta">({c.contact})</span>
                        </div>
                        <div className="search-item-secondary">
                          <span>{c.email}</span>
                          <span>{c.totalPesanan} Pesanan</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products */}
                {searchResults.products.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">Produk ({searchResults.products.length})</div>
                    {searchResults.products.map((p) => (
                      <div key={p.id} className="search-item">
                        <div className="search-item-primary">
                          <span className="search-name">{p.nama}</span>
                          <span className="search-meta">{p.kategori}</span>
                        </div>
                        <div className="search-item-secondary">
                          <span>Stok: {p.stok} {p.satuan}</span>
                          <span className="search-price">Rp {p.harga.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right User & Actions */}
      <div className="damaco-topbar-actions">
        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            className="damaco-icon-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Pemberitahuan"
          >
            <FiBell size={18} />
            {adminUnreadCount > 0 && (
              <span className="damaco-bell-badge">{adminUnreadCount}</span>
            )}
          </button>
        </div>

        {/* User Profile Pill */}
        <div
          className="damaco-profile-wrapper"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="damaco-avatar">
            {user?.nama ? (
              user.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            ) : (
              'AD'
            )}
          </div>
          <div className="damaco-profile-text">
            <span className="damaco-user-name">{user?.nama || 'Admin'}</span>
            <span className="damaco-user-role">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}</span>
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="damaco-profile-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-user-header">
                <strong>{user?.nama || 'Admin'}</strong>
                <small>{user?.email || 'admin@damaco.com'}</small>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item logout"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
              >
                Keluar dari Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

