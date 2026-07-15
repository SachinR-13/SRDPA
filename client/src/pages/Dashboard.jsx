import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getWallet } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, statsRes] = await Promise.all([
          getWallet(),
          getDashboardStats().catch(() => null),
        ]);
        const w = walletRes.data.wallet || walletRes.data.data || walletRes.data;
        setBalance(w?.balance || 0);
        if (statsRes?.data?.data) setStats(statsRes.data.data);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loader-gradient" />;

  return (
    <div className="page-content">
      {/* Balance Card */}
      <div className="balance-card">
        <div className="label">Wallet Balance</div>
        <div className="amount">₹{balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</div>
        <div className="sub">SRPay ID: {user?.srpayId}</div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {[
          { icon: 'bi-plus-circle', label: 'Add Money', color: '#667eea', path: '/wallet/add' },
          { icon: 'bi-send', label: 'Send', color: '#10B981', path: '/send-money' },
          { icon: 'bi-qr-code', label: 'My QR', color: '#8B5CF6', path: '/qr-code' },
          { icon: 'bi-camera', label: 'Scan', color: '#EF4444', path: '/scan' },
          { icon: 'bi-inbox', label: 'Request', color: '#F59E0B', path: '/requests' },
          { icon: 'bi-link-45deg', label: 'Pay Link', color: '#06B6D4', path: '/pay-links' },
          { icon: 'bi-arrow-repeat', label: 'AutoPay', color: '#8B5CF6', path: '/recurring' },
          { icon: 'bi-bank', label: 'Bank', color: '#EC4899', path: '/bank' },
        ].map((a, i) => (
          <Link key={i} to={a.path} className="quick-action-btn">
            <i style={{ background: a.color }} className={`bi ${a.icon}`}></i>
            <span>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Monthly Stats */}
      {stats && (
        <div className="card-modern mb-3">
          <div className="section-title mt-0">This Month</div>
          <div className="row g-2">
            <div className="col-6">
              <div className="p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600 }}>Income</div>
                <div className="fw-bold" style={{ color: '#065F46', fontSize: '1.1rem' }}>₹{stats.monthlyIncome?.toLocaleString('en-IN') || 0}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600 }}>Spent</div>
                <div className="fw-bold" style={{ color: '#991B1B', fontSize: '1.1rem' }}>₹{stats.monthlyExpense?.toLocaleString('en-IN') || 0}</div>
              </div>
            </div>
          </div>
          <div className="mt-2" style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
            <i className="bi bi-activity me-1"></i>
            {stats.todayTransactions || 0} transactions today
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="section-title mb-0">Recent Activity</div>
        <Link to="/transactions" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          View All <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      {stats?.recentTransactions?.length > 0 ? (
        stats.recentTransactions.map((tx) => (
          <div key={tx._id} className="tx-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/transactions/${tx._id}`)}>
            <div className="tx-icon" style={{
              background: tx.type === 'CREDIT'
                ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                : 'linear-gradient(135deg, #fee2e2, #fecaca)'
            }}>
              <i className={`bi ${tx.type === 'CREDIT' ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}
                style={{ color: tx.type === 'CREDIT' ? '#065F46' : '#991B1B' }}></i>
            </div>
            <div className="tx-info">
              <div className="name">{tx.description?.slice(0, 30) || 'Transaction'}</div>
              <div className="desc">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</div>
            </div>
            <div className={`tx-amount ${tx.type === 'CREDIT' ? 'credit' : 'debit'}`}>
              {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state" style={{ padding: '20px' }}>
          <i className="bi bi-arrow-left-right"></i>
          <p>No transactions yet</p>
        </div>
      )}
    </div>
  );
}