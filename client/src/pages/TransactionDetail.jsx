import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionDetails } from '../services/api';
import toast from 'react-hot-toast';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTransactionDetails(id);
        setTx(res.data.transaction);
      } catch { toast.error('Failed to load details'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="spinner-border text-primary" />
    </div>;
  }

  if (!tx) {
    return <div className="p-3"><div className="page-header"><button className="back-btn" onClick={() => navigate('/transactions')}><i className="bi bi-chevron-left"></i></button><h5>Not Found</h5></div></div>;
  }

  const isCredit = tx.type === 'credit';

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/transactions')}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <h5>Transaction Details</h5>
      </div>

      <div className="p-3">
        {/* Status Card */}
        <div className={`modern-card p-4 text-center mb-3 scale-in`}>
          <div className={`tx-icon mx-auto mb-3 ${isCredit ? 'tx-icon-green' : 'tx-icon-red'}`}
            style={{ width: 64, height: 64, borderRadius: 18, fontSize: 28 }}>
            <i className={`bi ${isCredit ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
          </div>
          <div className={`display-5 fw-bold mb-1 ${isCredit ? 'text-success' : 'text-danger'}`}>
            {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
          </div>
          <div className="fw-semibold mb-2" style={{ color: '#374151', fontSize: 15 }}>
            {isCredit ? 'Money Received' : 'Money Sent'}
          </div>
          <span className={`badge px-3 py-2 ${tx.status === 'completed' ? 'bg-success' : tx.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}
            style={{ borderRadius: 8, fontSize: 12 }}>
            {tx.status?.toUpperCase()}
          </span>
        </div>

        {/* Details Card */}
        <div className="modern-card">
          <div className="p-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h6 className="fw-bold mb-0" style={{ color: '#111827', fontSize: 14 }}>Transaction Information</h6>
          </div>
          <div className="p-4">
            <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>Transaction ID</span>
              <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>#{tx.transactionId || tx._id?.slice(-8)}</span>
            </div>
            {tx.senderName && (
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>From</span>
                <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>{tx.senderName}</span>
              </div>
            )}
            {tx.receiverName && (
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>To</span>
                <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>{tx.receiverName}</span>
              </div>
            )}
            {tx.senderSRPayId && (
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>Sender SRPay ID</span>
                <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>{tx.senderSRPayId}</span>
              </div>
            )}
            {tx.receiverSRPayId && (
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>Receiver SRPay ID</span>
                <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>{tx.receiverSRPayId}</span>
              </div>
            )}
            <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>Amount</span>
              <span className="fw-bold" style={{ color: '#111827', fontSize: 14 }}>₹{tx.amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>Date & Time</span>
              <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>{formatDate(tx.createdAt)}</span>
            </div>
            {tx.remark && (
              <div className="d-flex justify-content-between py-2">
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>Remark</span>
                <span className="fw-semibold" style={{ color: '#111827', fontSize: 13 }}>{tx.remark}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}