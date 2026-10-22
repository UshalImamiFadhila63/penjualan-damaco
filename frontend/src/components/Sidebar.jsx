import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiPackage, FiShoppingCart, FiUsers, FiTag,
  FiTruck, FiUser, FiLogOut, FiSettings,
} from 'react-icons/fi';

const navItems = [
  { label: 'MENU UTAMA', type: 'section' },
  { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { to: '/pos', icon: <FiShoppingCart />, label: 'Kasir (POS)' },
  { to: '/penjualan', icon: <FiShoppingCart />, label: 'Riwayat Penjualan' },

  { label: 'MASTER DATA', type: 'section' },
  { to: '/produk', icon: <FiPackage />, label: 'Produk', roles: ['admin', 'gudang'] },
  { to: '/kategori', icon: <FiTag />, label: 'Kategori', roles: ['admin'] },
  { to: '/supplier', icon: <FiTruck />, label: 'Supplier', roles: ['admin'] },
  { to: '/pelanggan', icon: <FiUsers />, label: 'Pelanggan' },

  { label: 'PENGATURAN', type: 'section' },
  { to: '/users', icon: <FiUser />, label: 'Manajemen User', roles: ['admin'] },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const visibleNavItems = navItems.filter(item => {
    if (item.type === 'section') return true;
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛍️</div>
        <div className="sidebar-logo-text">
          <h2>SistemJual</h2>
          <span>Point of Sales</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {visibleNavItems.map((item, i) => {
          if (item.type === 'section') {
            return (
              <div key={i} className="nav-section-label">{item.label}</div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--primary-subtle)', marginBottom: 8,
        }}>
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
            {user?.nama?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.nama}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', background: 'none', color: 'var(--danger)' }}
        >
          <FiLogOut className="nav-icon" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
