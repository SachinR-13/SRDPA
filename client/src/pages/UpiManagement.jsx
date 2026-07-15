import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getUpiIds, createUpiId, setPrimaryUpi, deleteUpiId, resolveUpiId } from '../services/api';

export default function UpiManagement() {
  const [upis, setUpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [nickname, setNickname] = useState('');
  const [resolveQuery, setResolveQuery] = useState('');
  const [resolveResult, setResolveResult] = useState(null);

  const fetchUpis = async () => {
    try {
      const res = await getUpiIds();
      setUpis(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load UPI IDs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUpis(); }, []);

  const handleCreate = async () => {
    try {
      await createUpiId(nickname);
      toast.success('UPI ID created!');
      setShowCreate(false);
      setNickname('');
      fetchUpis();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create UPI');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await setPrimaryUpi(id);
      toast.success('Primary UPI updated');
      fetchUpis();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this UPI ID?')) return;
    try {
      await deleteUpiId(id);
      toast.success('UPI ID deleted');
      fetchUpis();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const handleResolve = async () => {
    if (!resolveQuery.trim()) return;
    try {
      const res = await resolveUpiId(resolveQuery.trim());
      setResolveResult(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'UPI ID not found');
      setResolveResult(null);
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>UPI IDs</h1>
        <p>Manage your UPI payment addresses</p>
      </div>

      <div className="card-modern mb-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <input className="form-input flex-grow-1" placeholder="Search UPI ID (e.g., srp123@srpay)" value={resolveQuery} onChange={(e) => setResolveQuery(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={handleResolve}><i className="bi bi-search"></i></button>
        </div>
        {resolveResult && (
          <div className="p-2 bg-light rounded-3">
            <strong>{resolveResult.fullName}</strong><br />
            <small className="text-muted">{resolveResult.upiId}</small>
          </div>
        )}
      </div>

      <button className="btn-primary-custom mb-3" onClick={() => setShowCreate(!showCreate)}>
        <i className="bi bi-plus-lg me-2"></i> Create New UPI ID
      </button>

      {showCreate && (
        <div className="card-modern">
          <input className="form-input mb-2" placeholder="Nickname (e.g., My UPI)" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <button className="btn-primary-custom" onClick={handleCreate} disabled={!nickname.trim()}>Create UPI</button>
        </div>
      )}

      {upis.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-credit-card-2-front"></i>
          <p>No UPI IDs created yet</p>
        </div>
      ) : (
        upis.map((upi) => (
          <div key={upi.id} className="card-modern d-flex align-items-center justify-content-between">
            <div>
              <strong>{upi.upiId}</strong>
              {upi.isPrimary && <span className="badge-status badge-success ms-2">Primary</span>}
              {upi.nickname && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{upi.nickname}</div>}
            </div>
            <div className="d-flex gap-2">
              {!upi.isPrimary && (
                <>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleSetPrimary(upi.id)}>Set Primary</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(upi.id)}><i className="bi bi-trash"></i></button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}