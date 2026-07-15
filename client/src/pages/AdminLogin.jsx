import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, user } = res.data.data || res.data;
      if (user.role !== 'admin') {
        toast.error('Admin access only. Please use regular login.');
        setLoading(false);
        return;
      }
      login(token, user);
      toast.success('Welcome Admin!');
      navigate('/admin/dashboard');
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
          <Logo size={72} showText={false} variant="admin" />
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1a1a2e', marginTop: 12 }}>
            Admin Portal
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>
            Sign in with admin credentials
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Admin Email</label>
            <input type="email" className="input-modern"
              placeholder="admin@srpay.com" value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="input-modern"
              placeholder="Enter admin password" value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn-gradient" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }} disabled={loading}>
            {loading ? <span><span className="spinner-border spinner-border-sm me-2" />Signing in...</span> : 'Admin Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}