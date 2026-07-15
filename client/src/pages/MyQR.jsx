import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQR, generateDynamicQR } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function MyQR() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dynamicAmount, setDynamicAmount] = useState('');
  const [dynamicQRData, setDynamicQRData] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await getMyQR();
        setUserData(res.data.qr);
      } catch { toast.error('Failed to load QR'); }
      finally { setLoading(false); }
    };
    fetchQR();
  }, []);

  const handleGenerateDynamic = async () => {
    if (!dynamicAmount || dynamicAmount <= 0) { toast.error('Enter a valid amount'); return; }
    setGenerating(true);
    try {
      const res = await generateDynamicQR(Number(dynamicAmount));
      setDynamicQRData(res.data.qr);
    } catch { toast.error('Failed to generate'); }
    finally { setGenerating(false); }
  };

  const qrValue = userData?.srpayId || '';
  const qrImage = userData?.qrImage || '';
  const userName = userData?.fullName || '';

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <h5>My QR Code</h5>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <>
            {/* Static QR */}
            <div className="modern-card p-4 text-center mb-3">
              <h6 className="fw-bold mb-3" style={{ color: '#111827', fontSize: 14 }}>Your SRPay QR Code</h6>
              <div className="d-inline-block p-3 rounded-3" style={{ background: 'white', border: '2px solid #f3f4f6' }}>
                {qrImage ? (
                  <img src={qrImage} alt="QR" style={{ width: 200, height: 200 }} />
                ) : qrValue ? (
                  <QRCodeSVG value={qrValue} size={200} level="H" />
                ) : (
                  <p className="text-muted">No data</p>
                )}
              </div>
              <p className="mt-3 mb-1 fw-semibold" style={{ color: '#111827', fontSize: 14 }}>{userName}</p>
              <small style={{ color: '#9CA3AF', fontSize: 12 }}>{qrValue}</small>
            </div>

            {/* Dynamic QR */}
            <div className="modern-card p-4">
              <h6 className="fw-bold mb-3" style={{ color: '#111827', fontSize: 14 }}>Request Payment</h6>
              <div className="input-group input-group-modern mb-3">
                <span className="input-group-text">₹</span>
                <input type="number" className="form-control input-modern"
                  style={{ borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  placeholder="Enter amount" value={dynamicAmount}
                  onChange={(e) => setDynamicAmount(e.target.value)} />
                <button className="btn btn-modern btn-primary-modern" onClick={handleGenerateDynamic}
                  disabled={generating || !dynamicAmount}>
                  {generating ? <span className="spinner-border spinner-border-sm" /> : 'Generate'}
                </button>
              </div>

              {dynamicQRData && (
                <div className="text-center mt-3 scale-in">
                  <div className="d-inline-block p-3 rounded-3" style={{ background: 'white', border: '2px solid #f3f4f6' }}>
                    {dynamicQRData.qrImage ? (
                      <img src={dynamicQRData.qrImage} alt="Dynamic QR" style={{ width: 180, height: 180 }} />
                    ) : (
                      <QRCodeSVG value={JSON.stringify(dynamicQRData)} size={180} level="H" />
                    )}
                  </div>
                  <p className="mt-2 fw-semibold" style={{ color: '#059669', fontSize: 15 }}>₹{dynamicQRData.amount}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}