import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import Logo from './Logo';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: 'bi-house-fill' },
  { path: '/send-money', label: 'Pay', icon: 'bi-send-fill' },
  { path: '/requests', label: 'Request', icon: 'bi-inbox-fill' },
  { path: '/transactions', label: 'History', icon: 'bi-arrow-left-right' },
  { path: '/profile', label: 'Profile', icon: 'bi-person-fill' },
];

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data.unreadCount || 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Gradient Header with Logo */}
      <header className="gradient-header">
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Logo size={34} showText={true} variant="header" />
        </Link>
        <div className="header-actions">
          <Link to="/notifications" className="header-btn position-relative">
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Link>
          <button className="header-btn" onClick={() => setShowMenu(!showMenu)}>
            <i className="bi bi-grid-3x3-gap-fill"></i>
          </button>
        </div>
      </header>

      {/* Quick Menu Overlay */}
      {showMenu && (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: 80 }} onClick={() => setShowMenu(false)}>
          <div className="card-modern p-4" style={{ width: '90%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="fw-bold mb-3" style={{ fontSize: '1rem' }}>All Features</div>
            <div className="two-col-grid">
              {[
                { path: '/wallet', icon: 'bi-wallet2', label: 'Wallet', color: '#667eea' },
                { path: '/send-money', icon: 'bi-send', label: 'Send Money', color: '#10B981' },
                { path: '/requests', icon: 'bi-inbox', label: 'Requests', color: '#F59E0B' },
                { path: '/pay-links', icon: 'bi-link-45deg', label: 'Pay Links', color: '#EF4444' },
                { path: '/recurring', icon: 'bi-arrow-repeat', label: 'AutoPay', color: '#8B5CF6' },
                { path: '/bank', icon: 'bi-bank', label: 'Bank', color: '#06B6D4' },
                { path: '/upi', icon: 'bi-credit-card-2-front', label: 'UPI', color: '#EC4899' },
                { path: '/contacts', icon: 'bi-people', label: 'Contacts', color: '#14B8A6' },
                { path: '/qr-code', icon: 'bi-qr-code', label: 'My QR', color: '#667eea' },
                { path: '/scan', icon: 'bi-upc-scan', label: 'Scan QR', color: '#10B981' },
                { path: '/transactions', icon: 'bi-clock-history', label: 'History', color: '#F59E0B' },
                { path: '/profile', icon: 'bi-person-gear', label: 'Settings', color: '#8B5CF6' },
              ].map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setShowMenu(false)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '12px 8px', borderRadius: 12, textDecoration: 'none',
                    color: 'var(--text)', background: 'var(--bg)', fontSize: '0.75rem', fontWeight: 600,
                  }}>
                  <i className={`bi ${item.icon}`} style={{ fontSize: '1.3rem', color: item.color }}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-safe">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="d-flex justify-content-around px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/');
            return (
              <Link key={item.path} to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}>
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}