import { useState } from 'react';
import { addMoney } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function WalletAdd() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const res = await addMoney(Number(amount));
      toast.success(res.data.message || 'Money added!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

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
          <h1>Add Money</h1>
          <p>Credit funds to your wallet</p>
        </div>
      </div>

      <div className="px-1">
        <div className="card-modern p-4">
          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="mb-4">
              <label className="form-label">Amount</label>
              <div className="input-group-custom" style={{ fontSize: '1.2rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                  style={{ fontSize: '1.2rem' }}
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-4">
              <label className="form-label">Quick Select</label>
              <div className="d-flex gap-2 flex-wrap">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    style={{
                      flex: 1,
                      minWidth: 'calc(33% - 8px)',
                      padding: '14px 8px',
                      borderRadius: 12,
                      border: Number(amount) === val ? '2px solid #667eea' : '2px solid rgba(102,126,234,0.15)',
                      background: Number(amount) === val ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                      color: Number(amount) === val ? 'white' : '#1a1a2e',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="card-modern p-3 mb-4" style={{
              background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
              border: '1px solid rgba(102,126,234,0.15)',
            }}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-info-circle" style={{ fontSize: '1.3rem', color: '#667eea' }}></i>
                <small style={{ color: '#4a4a6a', lineHeight: 1.4 }}>
                  Money will be credited to your wallet instantly. Powered by Razorpay.
                </small>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-gradient"
              disabled={loading || !amount || Number(amount) <= 0}
            >
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2" />Processing...</span>
              ) : (
                <span><i className="bi bi-wallet2 me-2"></i>Add ₹{Number(amount || 0).toLocaleString('en-IN')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}