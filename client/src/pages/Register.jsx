import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, sendOtp, verifyOtp } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(form.phone, 'register');
      const data = res.data;
      if (data.otp) setDevOtp(data.otp);
      setStep(2);
      toast.success('OTP sent! Check server console for the code.');
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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(form.phone, otp, 'register');
      const res = await registerUser(form);
      toast.success(res.data.message || 'Account created! Please login.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message;
      if (!msg && data?.errors?.length) msg = data.errors.map(e => e.message || e.msg).join('. ');
      toast.error(msg || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await sendOtp(form.phone, 'register');
      if (res.data.otp) setDevOtp(res.data.otp);
      toast.success('OTP resent');
      setTimer(300);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
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
            {step === 1 ? 'Create Account' : 'Verify Phone'}
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>
            {step === 1 ? 'Join SRPay for secure payments' : `OTP sent to ${form.phone}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" className="input-modern"
                placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="input-modern"
                placeholder="john@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="input-modern"
                placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="input-modern"
                placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-gradient" disabled={loading}>
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2" />Sending OTP...</span>
              ) : 'Send OTP'}
            </button>
          </form>
        ) : (
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', marginBottom: 20 }}>
              Enter the 6-digit OTP sent to <strong>{form.phone}</strong>
            </p>
            {devOtp && (
              <div className="mb-3 p-3" style={{
                background: '#FFF7ED', border: '1px solid #FED7AA',
                borderRadius: 12, textAlign: 'center',
              }}>
                <span style={{ color: '#9A3412', fontSize: 12, fontWeight: 600 }}>DEV MODE OTP</span>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#EA580C', letterSpacing: 6, marginTop: 4 }}>
                  {devOtp}
                </div>
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
              disabled={loading || otp.length !== 6} onClick={handleVerifyOtp}>
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2" />Verifying...</span>
              ) : 'Verify & Create Account'}
            </button>
            {timer === 0 ? (
              <button className="btn-gradient btn-gradient-outline mt-2" onClick={handleResendOtp} disabled={loading}>
                Resend OTP
              </button>
            ) : null}
            <button className="btn w-100 mt-3" style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13 }}
              onClick={() => { setStep(1); setOtp(''); }}>
              ← Change phone number
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#667eea', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}