import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, sendMoney } from '../services/api';
import toast from 'react-hot-toast';

export default function SendMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length < 2) { setUsers([]); return; }
    setSearching(true);
    try {
      const res = await searchUsers(val);
      setUsers(res.data.users || []);
    } catch { setUsers([]); }
    finally { setSearching(false); }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setStep(2);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    if (!pin || pin.length < 6) { toast.error('Enter a valid 6-digit PIN'); return; }
    setLoading(true);
    try {
      const res = await sendMoney(selectedUser.srpayId, Number(amount), pin);
      toast.success(res.data.message || 'Money sent!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send money');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <h5>Send Money</h5>
      </div>

      <div className="p-3">
        {step === 1 && (
          <div className="modern-card p-4">
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                Search by name, phone, or SRPay ID
              </label>
              <input
                type="text"
                className="form-control input-modern"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {searching && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            )}

            {users.length > 0 && (
              <div className="d-flex flex-column gap-2 mt-3">
                {users.map((u) => (
                  <button key={u._id} className="user-search-item" onClick={() => selectUser(u)}>
                    <div className="avatar avatar-gradient avatar-sm">
                      {u.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-start flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: 14, color: '#111827' }}>{u.fullName}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{u.srpayId} · {u.phone}</div>
                    </div>
                    <i className="bi bi-chevron-right" style={{ color: '#D1D5DB' }}></i>
                  </button>
                ))}
              </div>
            )}

            {users.length === 0 && searchQuery.length >= 2 && !searching && (
              <div className="text-center py-4">
                <i className="bi bi-search" style={{ fontSize: 32, color: '#D1D5DB' }}></i>
                <p className="mt-2" style={{ color: '#9CA3AF', fontSize: 14 }}>No users found</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedUser && (
          <div className="modern-card p-4">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-4" style={{ background: '#F3F4F6' }}>
              <div className="avatar avatar-green" style={{ width: 48, height: 48, borderRadius: 14, fontSize: 20 }}>
                {selectedUser.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold" style={{ color: '#111827' }}>{selectedUser.fullName}</div>
                <small style={{ color: '#6B7280' }}>{selectedUser.srpayId}</small>
              </div>
              <button className="btn btn-sm" style={{ background: 'white', borderRadius: 10, color: '#6B7280' }}
                onClick={() => { setStep(1); setSelectedUser(null); }}>
                Change
              </button>
            </div>

            <form onSubmit={handleSend}>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Amount</label>
                <div className="input-group input-group-modern input-group-lg">
                  <span className="input-group-text" style={{ fontSize: 18 }}>₹</span>
                  <input type="number" className="form-control input-modern"
                    style={{ borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    placeholder="Enter amount" value={amount}
                    onChange={(e) => setAmount(e.target.value)} min="1" required />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: 13, color: '#374151' }}>Transaction PIN</label>
                <input type="password" className="form-control input-modern text-center"
                  placeholder="Enter 6-digit PIN" value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6} required />
              </div>

              <button type="submit" className="btn btn-modern btn-success-modern w-100"
                disabled={loading || !amount || pin.length < 6}>
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2" />Sending...</span>
                ) : `Send ₹${Number(amount || 0).toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}