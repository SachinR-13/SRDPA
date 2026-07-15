import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanQR, searchUsers } from '../services/api';
import toast from 'react-hot-toast';

export default function ScanQR() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  const [srpayId, setSrpayId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch {
      toast.error('Camera access denied');
      setMode('manual');
    }
  };

  const handleManualScan = async (e) => {
    e.preventDefault();
    const id = srpayId.trim().toUpperCase();
    if (!id) { toast.error('Enter an SRPay ID'); return; }
    setLoading(true);
    try {
      // Try scanning as QR data format first
      const res = await scanQR(`SRPAY://PAY?user=${id}`);
      setResult(res.data.user || res.data);
      toast.success('User found!');
    } catch {
      // Fallback: search users by the entered ID directly
      try {
        const searchRes = await searchUsers(id);
        const users = searchRes.data.users || [];
        if (users.length > 0) {
          setResult(users[0]);
          toast.success('User found!');
        } else {
          toast.error(`No user found with ID: ${id}`);
        }
      } catch {
        toast.error('User not found');
      }
    }
    finally { setLoading(false); }
  };

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
          <h1>Scan QR</h1>
          <p>Find users by QR or SRPay ID</p>
        </div>
      </div>

      <div className="px-1">
        {!result && (
          <div className="tab-switch mb-3">
            <button className={mode === 'manual' ? 'active' : ''}
              onClick={() => { setMode('manual'); stopCamera(); }}>
              <i className="bi bi-keyboard me-1"></i> Manual
            </button>
            <button className={mode === 'scan' ? 'active' : ''}
              onClick={() => { setMode('scan'); startCamera(); }}>
              <i className="bi bi-camera me-1"></i> Camera
            </button>
          </div>
        )}

        {!result && mode === 'scan' && (
          <div className="card-modern p-4 text-center">
            <video ref={videoRef} autoPlay playsInline className="w-100 rounded-3" style={{ maxHeight: 280, background: '#000' }} />
            <p className="mt-3 mb-3" style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              <i className="bi bi-camera-video me-1"></i> Point camera at a QR code
            </p>
            <button className="btn-gradient btn-sm-gradient" style={{ width: 'auto', background: 'var(--gradient-accent)' }}
              onClick={() => { stopCamera(); setMode('manual'); }}>
              <i className="bi bi-keyboard me-1"></i> Enter Manually
            </button>
          </div>
        )}

        {!result && mode === 'manual' && (
          <div className="card-modern p-4">
            <form onSubmit={handleManualScan}>
              <div className="mb-3">
                <label className="form-label">Enter SRPay ID</label>
                <input type="text" className="input-modern text-center"
                  style={{ fontSize: '1.2rem', letterSpacing: 2, fontWeight: 700 }}
                  placeholder="e.g. SRP818387" value={srpayId}
                  onChange={(e) => setSrpayId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  required />
              </div>
              <button type="submit" className="btn-gradient" disabled={loading || !srpayId.trim()}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : <span><i className="bi bi-search me-2"></i>Find User</span>}
              </button>
            </form>
          </div>
        )}

        {result && (
          <div className="card-modern p-4 text-center scale-in">
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '1.6rem', fontWeight: 800, color: 'white'
            }}>
              {result.fullName?.charAt(0) || 'U'}
            </div>
            <h5 className="fw-bold mb-1" style={{ color: '#111827' }}>{result.fullName}</h5>
            <p className="mb-1" style={{ color: '#6B7280', fontSize: 13 }}>{result.email}</p>
            <p className="mb-3" style={{ color: '#6B7280', fontSize: 13 }}>{result.phone}</p>
            <span className="badge-status badge-info" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
              {result.srpayId}
            </span>
            <div className="d-flex flex-column gap-2 mt-4">
              <button className="btn-gradient btn-gradient-success"
                onClick={() => navigate('/send-money', { state: { recipient: result } })}>
                <i className="bi bi-send me-2"></i> Send Money
              </button>
              <button className="btn-gradient btn-gradient-outline" style={{ marginTop: 0 }}
                onClick={() => { setResult(null); setSrpayId(''); }}>
                <i className="bi bi-arrow-repeat me-1"></i> Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}