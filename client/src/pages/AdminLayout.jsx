import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/admin/users', label: 'Users', icon: 'bi-people' },
  { path: '/admin/wallets', label: 'Wallets', icon: 'bi-wallet2' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0c29' }}>
      {/* Admin Header */}
      <header style={{
        background: 'linear-gradient(135deg, #DC2626, #991B1B)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
      }}>
        <Logo size={32} showText={true} variant="header" />
        <div className="d-flex gap-2">
          <button onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', borderRadius: 8, padding: '8px 12px',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            }}>
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: '12px 16px',
        background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {adminNavItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              style={{
                flex: 1, textDecoration: 'none', textAlign: 'center',
                padding: '10px 8px', borderRadius: 10,
                background: isActive ? 'rgba(220,38,38,0.2)' : 'transparent',
                color: isActive ? '#EF4444' : 'rgba(255,255,255,0.5)',
                fontWeight: 700, fontSize: '0.75rem',
                border: isActive ? '1px solid rgba(220,38,38,0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}>
              <i className={`bi ${item.icon} me-1`}></i>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Admin Content */}
      <main style={{ padding: '16px', maxWidth: 700, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}