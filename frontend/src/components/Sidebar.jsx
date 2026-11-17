import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiPlus,
  FiTag,
  FiUsers,
  FiList,
  FiLogOut,
} from 'react-icons/fi';
import DamacoLogo from './DamacoLogo';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const {
    metrics,
    setIsCreateOrderModalOpen,
  } = useDamaco();
  const { logout } = useAuth();

  return (
    <aside className="damaco-sidebar">
      {/* Top Logo */}
      <div className="damaco-sidebar-header">
        <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
          <DamacoLogo size="medium" />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="damaco-nav-menu">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `damaco-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="nav-link-content">
            <FiHome className="nav-icon" />
            <span>Dashboard</span>
          </div>
          {metrics.butuhTindakanCount > 0 && (
            <span className="nav-badge-count">{metrics.butuhTindakanCount}</span>
          )}
        </NavLink>

        {/* Semua Pesanan */}
        <NavLink
          to="/pesanan"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('damaco:reset-order-list'));
          }}
          className={({ isActive }) => `damaco-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="nav-link-content">
            <FiPackage className="nav-icon" />
            <span>Semua pesanan</span>
          </div>
        </NavLink>

        {/* Kelola Produk */}
        <NavLink
          to="/kelola-produk"
          className={({ isActive }) => `damaco-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="nav-link-content">
            <FiTag className="nav-icon" />
            <span>Kelola produk</span>
          </div>
        </NavLink>

        {/* Kelola Customer */}
        <NavLink
          to="/kelola-customer"
          className={({ isActive }) => `damaco-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="nav-link-content">
            <FiUsers className="nav-icon" />
            <span>Kelola customer</span>
          </div>
        </NavLink>

        {/* Log Aktivitas */}
        <NavLink
          to="/log-aktivitas"
          className={({ isActive }) => `damaco-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="nav-link-content">
            <FiList className="nav-icon" />
            <span>Log aktivitas</span>
          </div>
        </NavLink>
      </nav>

      {/* Bottom Actions: Keluar */}
      <div className="damaco-sidebar-bottom">
        <button
          type="button"
          className="damaco-nav-link subtle-link logout"
          onClick={logout}
          title="Keluar dari akun admin"
        >
          <div className="nav-link-content">
            <FiLogOut className="nav-icon" />
            <span>Keluar</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
