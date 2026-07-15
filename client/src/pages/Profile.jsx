import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, submitKyc, toggle2FA, updateLimits, changePassword, setTransactionPin, changeTransactionPin } from '../services/api';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  // Profile form
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', gender: '', address: { street: '', city: '', state: '', pincode: '' } });

  // KYC
  const [kycForm, setKycForm] = useState({ panCard: '', aadhaarLast4: '' });

  // Limits
  const [limitForm, setLimitForm] = useState({ dailyLimit: 50000, transactionLimit: 10000 });

  // Password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  // PIN
  const [pinForm, setPinForm] = useState({ pin: '', confirmPin: '' });
  const [changePinForm, setChangePinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [showChangePin, setShowChangePin] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      const p = res.data.data || res.data.user;
      setProfile(p);
      updateUser(p);
      setForm({
        fullName: p.fullName || '',
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        gender: p.gender || '',
        address: p.address || { street: '', city: '', state: '', pincode: '' },
      });
      setLimitForm({ dailyLimit: p.dailyLimit || 50000, transactionLimit: p.transactionLimit || 10000 });
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
      setEditMode(false);
      fetchProfile();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleKyc = async () => {
    try {
      await submitKyc(kycForm);
      toast.success('KYC submitted!');
      setKycForm({ panCard: '', aadhaarLast4: '' });
      fetchProfile();
    } catch (e) { toast.error(e.response?.data?.message || 'KYC failed'); }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await toggle2FA();
      toast.success(res.data.message);
      fetchProfile();
    } catch (e) { toast.error('Failed'); }
  };

  const handleUpdateLimits = async () => {
    try {
      await updateLimits(limitForm);
      toast.success('Limits updated!');
      fetchProfile();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleSetPin = async () => {
    if (pinForm.pin.length !== 6) { toast.error('PIN must be exactly 6 digits'); return; }
    if (pinForm.pin !== pinForm.confirmPin) { toast.error('PINs do not match'); return; }
    try {
      await setTransactionPin(pinForm.pin);
      toast.success('Transaction PIN set!');
      setPinForm({ pin: '', confirmPin: '' });
      fetchProfile();
    } catch (e) { toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed'); }
  };

  const handleChangePin = async () => {
    if (changePinForm.newPin.length !== 6) { toast.error('PIN must be exactly 6 digits'); return; }
    if (changePinForm.newPin !== changePinForm.confirmPin) { toast.error('PINs do not match'); return; }
    try {
      await changeTransactionPin(changePinForm.oldPin, changePinForm.newPin);
      toast.success('PIN changed!');
      setChangePinForm({ oldPin: '', newPin: '', confirmPin: '' });
      setShowChangePin(false);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  if (loading) return <div className="loader-gradient" />;

  return (
    <div className="page-content">
      {/* Profile Header */}
      <div className="page-header">
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'white',
          }}>{profile?.fullName?.[0] || 'U'}</div>
          <div>
            <h1 className="mb-0">{profile?.fullName}</h1>
            <p className="mb-0" style={{ fontSize: '0.8rem', opacity: 0.8 }}>@{profile?.srpayId}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-switch mb-3">
        {['profile', 'kyc', 'security', 'limits'].map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            <i className={`bi ${t === 'profile' ? 'bi-person' : t === 'kyc' ? 'bi-patch-check' : t === 'security' ? 'bi-shield-lock' : 'bi-sliders'} me-1`}></i>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <>
          <div className="card-modern">
            <div className="d-flex justify-content-between mb-2">
              <div className="section-title mt-0">Personal Info</div>
              <button className="btn-gradient btn-sm-gradient" style={{ width: 'auto', background: editMode ? 'var(--gradient-secondary)' : 'var(--gradient-accent)', padding: '6px 14px' }} onClick={() => setEditMode(!editMode)}>
                <i className={`bi ${editMode ? 'bi-x' : 'bi-pencil'} me-1`}></i>
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editMode ? (
              <>
                <input className="input-modern mb-2" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} placeholder="Full Name" />
                <input className="input-modern mb-2" type="date" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} />
                <select className="input-modern mb-2" value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input className="input-modern mb-2" placeholder="Street" value={form.address.street} onChange={(e) => setForm({...form, address: {...form.address, street: e.target.value}})} />
                <div className="row g-2 mb-2">
                  <div className="col-4"><input className="input-modern" placeholder="City" value={form.address.city} onChange={(e) => setForm({...form, address: {...form.address, city: e.target.value}})} /></div>
                  <div className="col-4"><input className="input-modern" placeholder="State" value={form.address.state} onChange={(e) => setForm({...form, address: {...form.address, state: e.target.value}})} /></div>
                  <div className="col-4"><input className="input-modern" placeholder="Pincode" value={form.address.pincode} onChange={(e) => setForm({...form, address: {...form.address, pincode: e.target.value}})} /></div>
                </div>
                <button className="btn-gradient" onClick={handleUpdateProfile}>Save Changes</button>
              </>
            ) : (
              <>
                <div className="mb-1" style={{ fontSize: '0.9rem' }}><i className="bi bi-envelope me-2 text-muted"></i><strong>Email:</strong> {profile?.email}</div>
                <div className="mb-1" style={{ fontSize: '0.9rem' }}><i className="bi bi-phone me-2 text-muted"></i><strong>Phone:</strong> {profile?.phone}</div>
                <div style={{ fontSize: '0.9rem' }}><i className="bi bi-credit-card-2-front me-2 text-muted"></i><strong>SRPay ID:</strong> {profile?.srpayId}</div>
                {profile?.dateOfBirth && <div style={{ fontSize: '0.9rem' }}><i className="bi bi-calendar me-2 text-muted"></i><strong>DOB:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</div>}
                {profile?.address?.city && <div style={{ fontSize: '0.9rem' }}><i className="bi bi-geo-alt me-2 text-muted"></i><strong>City:</strong> {profile.address.city}</div>}
              </>
            )}
          </div>

          <div className="card-modern">
            <div className="section-title mt-0">Account Status</div>
            <div className="d-flex justify-content-between mb-2">
              <span>KYC Status</span>
              <span className={`badge-status ${profile?.isKycCompleted ? 'badge-success' : 'badge-warning'}`}>
                {profile?.isKycCompleted ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>2FA</span>
              <span className={`badge-status ${profile?.isTwoFactorEnabled ? 'badge-success' : 'badge-info'}`}>
                {profile?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Daily Limit</span>
              <span className="fw-bold">₹{(profile?.dailyLimit || 50000).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </>
      )}

      {tab === 'kyc' && (
        <div className="card-modern">
          <div className="section-title mt-0">KYC Verification</div>
          {profile?.isKycCompleted ? (
            <div className="text-center py-3">
              <i className="bi bi-patch-check-fill" style={{ fontSize: '3rem', color: '#059669' }}></i>
              <p className="mt-2 fw-bold" style={{ color: '#059669' }}>KYC Verified ✓</p>
            </div>
          ) : (
            <>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Submit your PAN and Aadhaar for KYC</p>
              <input className="input-modern mb-2" placeholder="PAN Card (e.g., ABCDE1234F)" value={kycForm.panCard} onChange={(e) => setKycForm({...kycForm, panCard: e.target.value.toUpperCase()})} />
              <input className="input-modern mb-2" placeholder="Aadhaar Last 4 Digits" maxLength={4} value={kycForm.aadhaarLast4} onChange={(e) => setKycForm({...kycForm, aadhaarLast4: e.target.value})} />
              <button className="btn-gradient" onClick={handleKyc} disabled={!kycForm.panCard || !kycForm.aadhaarLast4}>Submit KYC</button>
            </>
          )}
        </div>
      )}

      {tab === 'security' && (
        <>
          <div className="card-modern">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Two-Factor Auth</strong>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Add extra security</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={profile?.isTwoFactorEnabled || false} onChange={handleToggle2FA} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="card-modern">
            <div className="section-title mt-0">Transaction PIN</div>
            {profile?.transactionPin ? (
              <button className="btn-gradient btn-sm-gradient" style={{ width: 'auto', background: 'var(--gradient-accent)' }} onClick={() => setShowChangePin(!showChangePin)}>
                Change Transaction PIN
              </button>
            ) : (
              <>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Set a <strong>6-digit PIN</strong> for transaction verification</p>
                <input className="input-modern mb-2" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" placeholder="Enter 6-digit PIN" value={pinForm.pin} onChange={(e) => setPinForm({...pinForm, pin: e.target.value.replace(/\D/g, '')})} />
                <input className="input-modern mb-2" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" placeholder="Confirm 6-digit PIN" value={pinForm.confirmPin} onChange={(e) => setPinForm({...pinForm, confirmPin: e.target.value.replace(/\D/g, '')})} />
                <button className="btn-gradient" onClick={handleSetPin} disabled={!pinForm.pin || pinForm.pin !== pinForm.confirmPin || pinForm.pin.length !== 6}>Set PIN</button>
              </>
            )}
            {showChangePin && (
              <div className="mt-3">
                <input className="input-modern mb-2" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" placeholder="Old 6-digit PIN" value={changePinForm.oldPin} onChange={(e) => setChangePinForm({...changePinForm, oldPin: e.target.value.replace(/\D/g, '')})} />
                <input className="input-modern mb-2" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" placeholder="New 6-digit PIN" value={changePinForm.newPin} onChange={(e) => setChangePinForm({...changePinForm, newPin: e.target.value.replace(/\D/g, '')})} />
                <input className="input-modern mb-2" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" placeholder="Confirm new 6-digit PIN" value={changePinForm.confirmPin} onChange={(e) => setChangePinForm({...changePinForm, confirmPin: e.target.value.replace(/\D/g, '')})} />
                <button className="btn-gradient" onClick={handleChangePin} disabled={!changePinForm.oldPin || !changePinForm.newPin || changePinForm.newPin !== changePinForm.confirmPin || changePinForm.newPin.length !== 6}>Change PIN</button>
              </div>
            )}
          </div>

          <div className="card-modern">
            <div className="section-title mt-0">Password</div>
            <input className="input-modern mb-2" type="password" placeholder="Current Password" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} />
            <input className="input-modern mb-2" type="password" placeholder="New Password (min 6 chars)" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} />
            <button className="btn-gradient" onClick={handleChangePassword} disabled={!pwForm.currentPassword || !pwForm.newPassword}>Change Password</button>
          </div>
        </>
      )}

      {tab === 'limits' && (
        <div className="card-modern">
          <div className="section-title mt-0">Transaction Limits</div>
          <div className="mb-2">
            <label className="form-label">Daily Limit (max ₹1,00,000)</label>
            <input className="input-modern" type="number" value={limitForm.dailyLimit} onChange={(e) => setLimitForm({...limitForm, dailyLimit: Number(e.target.value)})} />
          </div>
          <div className="mb-3">
            <label className="form-label">Per Transaction Limit (max ₹50,000)</label>
            <input className="input-modern" type="number" value={limitForm.transactionLimit} onChange={(e) => setLimitForm({...limitForm, transactionLimit: Number(e.target.value)})} />
          </div>
          <button className="btn-gradient" onClick={handleUpdateLimits}>Update Limits</button>
        </div>
      )}
    </div>
  );
}