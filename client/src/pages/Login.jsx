import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, sendLoginOtp, verifyLoginOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function Login() {
  const [mode, setMode] = useState('email');
  const [form, setForm] = useState({ email: '', password: '' });
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, user } = res.data.data || res.data;
      login(token, user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendLoginOtp(phone);
      if (res.data.otp) setDevOtp(res.data.otp);
      setStep(2);
      toast.success('OTP sent! Check server console.');
      setTimer(300);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLogin = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyLoginOtp(phone, otp);
      const { token, user } = res.data;
      login(token, user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <Logo size={72} showText={false} />
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1a1a2e', marginTop: 12 }}>
            Welcome to SRPay
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>
            Sign in to your account
          </p>
        </div>

        <div className="tab-switch">
          <button
            className={mode === 'email' ? 'active' : ''}
            onClick={() => { setMode('email'); setStep(1); setOtp(''); }}
          >
            <i className="bi bi-envelope me-1"></i> Email
          </button>
          <button
            className={mode === 'phone' ? 'active' : ''}
            onClick={() => { setMode('phone'); setStep(1); setOtp(''); }}
          >
            <i className="bi bi-phone me-1"></i> Phone
          </button>
        </div>

        {mode === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="input-modern"
                placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input type="password" className="input-modern"
                placeholder="Enter your password" value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn-gradient" disabled={loading}>
              {loading ? <span><span className="spinner-border spinner-border-sm me-2" />Signing in...</span> : 'Sign In'}
            </button>
          </form>
        ) : step === 1 ? (
          <div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="input-modern"
                placeholder="9876543210" value={phone}
                onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <button className="btn-gradient" disabled={loading} onClick={handleSendOtp}>
              {loading ? <span><span className="spinner-border spinner-border-sm me-2" />Sending OTP...</span> : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', marginBottom: 20 }}>
              Enter OTP sent to <strong>{phone}</strong>
            </p>
            {devOtp && (
              <div className="mb-3 p-3" style={{
                background: '#FFF7ED', border: '1px solid #FED7AA',
                borderRadius: 12, textAlign: 'center',
              }}>
                <span style={{ color: '#9A3412', fontSize: 12, fontWeight: 600 }}>DEV MODE OTP</span>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#EA580C', letterSpacing: 6, marginTop: 4 }}>{devOtp}</div>
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">OTP</label>
              <input type="text" className="input-modern text-center"
                style={{ fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
                placeholder="------" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus />
            </div>
            {timer > 0 && (
              <p className="text-center mb-3" style={{ color: '#9CA3AF', fontSize: 13 }}>
                OTP expires in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </p>
            )}
            <button className="btn-gradient mb-2"
              disabled={loading || otp.length !== 6} onClick={handleVerifyOtpLogin}>
              {loading ? <span><span className="spinner-border spinner-border-sm me-2" />Verifying...</span> : 'Verify & Login'}
            </button>
            {timer === 0 ? (
              <button className="btn-gradient btn-gradient-outline mt-2" onClick={handleSendOtp} disabled={loading}>
                Resend OTP
              </button>
            ) : null}
            <button className="btn w-100 mt-3" style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13 }}
              onClick={() => { setStep(1); setOtp(''); }}>← Change phone number</button>
          </div>
        )}

        <div className="text-center mt-4">
          <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: '#667eea', fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}