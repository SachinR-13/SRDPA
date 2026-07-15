import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../services/api';
import toast from 'react-hot-toast';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = filter !== 'all' ? { type: filter.toUpperCase() } : {};
        const res = await getTransactions(params);
        setTransactions(res.data.transactions || []);
      } catch { toast.error('Failed to load transactions'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getType = (tx) => {
    const type = (tx.type || '').toUpperCase();
    return type === 'CREDIT' ? 'credit' : 'debit';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="loader-gradient" />
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      {/* Page Header */}
      <div className="page-header d-flex align-items-center gap-3 mb-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="header-btn"
          style={{ background: 'rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: 10 }}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <div>
          <h1>Transactions</h1>
          <p>Your payment history</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-switch mb-3">
        {['all', 'credit', 'debit'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'credit' ? 'Received' : 'Sent'}
          </button>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-arrow-left-right"></i>
          <p>No transactions found</p>
        </div>
      ) : (
        <div>
          {transactions.map((tx) => {
            const type = getType(tx);
            return (
              <div
                key={tx._id}
                className="tx-item"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/transactions/${tx._id}`)}
              >
                <div className="tx-icon" style={{
                  background: type === 'credit'
                    ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                    : 'linear-gradient(135deg, #fee2e2, #fecaca)'
                }}>
                  <i className={`bi ${type === 'credit' ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}
                    style={{ color: type === 'credit' ? '#065F46' : '#991B1B' }}></i>
                </div>
                <div className="tx-info">
                  <div className="name">
                    {type === 'credit' ? 'Received' : 'Sent'}
                  </div>
                  <div className="desc">
                    {tx.senderName && `From: ${tx.senderName} · `}
                    {tx.receiverName && `To: ${tx.receiverName} · `}
                    {formatDate(tx.createdAt)}
                  </div>
                </div>
                <div className={`tx-amount ${type === 'credit' ? 'credit' : 'debit'}`}>
                  {type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, textAlign: 'right' }}>
                    {tx.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}