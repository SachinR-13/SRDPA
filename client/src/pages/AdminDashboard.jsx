import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const path = location.pathname;
  const tab = path.includes('/users') ? 'users' : path.includes('/wallets') ? 'wallets' : 'dashboard';

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access only');
      navigate('/login');
      return;
    }
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'users') loadUsers();
    if (tab === 'wallets') loadWallets();
  }, [tab]);

  const loadDashboard = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      setDashboard(res.data.dashboard);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadWallets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/wallets');
      setWallets(res.data.wallets || []);
    } catch (err) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (userId, currentBlockedStatus) => {
    const action = currentBlockedStatus ? 'unblock' : 'block';
    setActionLoading(userId);
    try {
      const res = await API({
        method: 'patch',
        url: `/admin/users/${userId}/${action}`,
        data: {}  // Send empty body to avoid 415 Unsupported Media Type
      });
      toast.success(`User ${action}ed successfully`);
      const refreshed = await API.get('/admin/users');
      setUsers(refreshed.data.users || []);
    } catch (err) {
      console.error('Block error:', err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || err.message || `Failed to ${action} user`;
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return loadUsers();
    if (searchQuery.trim().length < 2) {
      toast.error('Search must be at least 2 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await API.get('/admin/users/search', { params: { q: searchQuery } });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {tab === 'dashboard' && dashboard && (
        <div>
          <div className="row g-3 mb-3">
            <StatCard icon="bi-people" label="Total Users" value={dashboard.totalUsers} color="#667eea" bg="#EDE9FE" />
            <StatCard icon="bi-wallet2" label="Total Wallets" value={dashboard.totalWallets} color="#059669" bg="#D1FAE5" />
            <StatCard icon="bi-cash-stack" label="Total Balance" value={`₹${(dashboard.totalWalletBalance || 0).toLocaleString()}`} color="#2563EB" bg="#DBEAFE" />
            <StatCard icon="bi-arrow-left-right" label="Transactions" value={dashboard.totalTransactions} color="#7C3AED" bg="#EDE9FE" />
            <StatCard icon="bi-check-circle" label="Successful" value={dashboard.successfulTransactions} color="#059669" bg="#D1FAE5" />
            <StatCard icon="bi-x-circle" label="Failed" value={dashboard.failedTransactions} color="#DC2626" bg="#FEE2E2" />
            <StatCard icon="bi-clock" label="Pending" value={dashboard.pendingTransactions} color="#EA580C" bg="#FFEDD5" />
            <StatCard icon="bi-calendar" label="Today" value={dashboard.todayTransactions} color="#DB2777" bg="#FCE7F3" />
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          {/* Search */}
          <div className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="input-modern"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-gradient btn-sm-gradient" style={{ width: 'auto', padding: '0 20px' }} onClick={handleSearch}>
              <i className="bi bi-search"></i>
            </button>
          </div>

          {loading ? (
            <div className="loader-gradient" />
          ) : users.length === 0 ? (
            <div className="empty-state" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <i className="bi bi-people"></i>
              <p>No users found</p>
            </div>
          ) : (
            <div>
              {users.map(u => (
                <div key={u._id} className="card-modern p-3 mb-2" style={{ background: '#1e1e36', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="fw-bold" style={{ fontSize: 14, color: 'white' }}>{u.fullName}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{u.email} · {u.phone}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        <span style={{ background: 'rgba(102,126,234,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 6, fontSize: 10 }}>{u.role}</span>
                        {' '}SRPay: {u.srpayId}
                      </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: u.isBlocked ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                        color: u.isBlocked ? '#ef4444' : '#10b981',
                      }}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                      <button
                        onClick={() => handleBlockUnblock(u._id, u.isBlocked)}
                        disabled={actionLoading === u._id}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: u.isBlocked ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          opacity: actionLoading === u._id ? 0.6 : 1,
                        }}
                      >
                        {actionLoading === u._id ? '...' : (u.isBlocked ? 'Unblock' : 'Block')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'wallets' && (
        <div>
          {loading ? (
            <div className="loader-gradient" />
          ) : wallets.length === 0 ? (
            <div className="empty-state" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <i className="bi bi-wallet2"></i>
              <p>No wallets found</p>
            </div>
          ) : (
            wallets.map(w => (
              <div key={w._id} className="card-modern p-3 mb-2" style={{ background: '#1e1e36', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold" style={{ fontSize: 14, color: 'white' }}>
                      {w.userId?.fullName || w.userId || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      Balance: <span className="fw-bold" style={{ color: '#10b981' }}>₹{(w.balance || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: w.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    color: w.isActive ? '#10b981' : '#ef4444',
                  }}>
                    {w.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="col-6">
      <div className="card-modern p-3" style={{ border: 'none', background: '#1e1e36' }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: bg, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            <i className={`bi ${icon}`}></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{value || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}