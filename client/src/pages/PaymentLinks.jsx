import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createPaymentLink, getMyPaymentLinks, cancelPaymentLink, payViaLink, getPaymentLinkDetails } from '../services/api';

export default function PaymentLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ amount: '', description: '' });
  const [newLink, setNewLink] = useState(null);
  const [payCode, setPayCode] = useState('');
  const [pinModal, setPinModal] = useState(null);
  const [payLinkCode, setPayLinkCode] = useState('');

  const fetchLinks = async () => {
    try {
      const res = await getMyPaymentLinks();
      setLinks(res.data.data || []);
    } catch (e) { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleCreate = async () => {
    try {
      const res = await createPaymentLink(Number(form.amount), form.description);
      setNewLink(res.data.data);
      toast.success('Payment link created!');
      setShowCreate(false);
      setForm({ amount: '', description: '' });
      fetchLinks();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleCancelLink = async (id) => {
    if (!confirm('Cancel this link?')) return;
    try { await cancelPaymentLink(id); toast.success('Cancelled'); fetchLinks(); } catch (e) { toast.error('Failed'); }
  };

  const handlePayLink = async () => {
    try {
      await payViaLink(payLinkCode, pinModal);
      toast.success('Payment successful!');
      setPinModal(null);
      setPayLinkCode('');
      fetchLinks();
    } catch (e) { toast.error(e.response?.data?.message || 'Payment failed'); }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Payment Links</h1>
        <p>Create & share payment links</p>
      </div>

      <button className="btn-primary-custom mb-3" onClick={() => setShowCreate(!showCreate)}>
        <i className="bi bi-link-45deg me-2"></i> Create Payment Link
      </button>

      {showCreate && (
        <div className="card-modern mb-3">
          <div className="input-group-custom mb-2"><span>₹</span><input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
          <input className="form-input mb-2" placeholder="What's this for?" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          <button className="btn-primary-custom" onClick={handleCreate} disabled={!form.amount}>Generate Link</button>
          {newLink && (
            <div className="mt-3 p-3 bg-light rounded-3">
              <div className="fw-bold">Link created!</div>
              <div className="text-primary" style={{fontSize:'0.85rem', wordBreak:'break-all'}}>{newLink.url}</div>
              <div className="text-muted" style={{fontSize:'0.8rem'}}>Code: {newLink.code}</div>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => { navigator.clipboard.writeText(newLink.url); toast.success('Copied!'); }}>Copy Link</button>
            </div>
          )}
        </div>
      )}

      {/* Pay a link */}
      <div className="card-modern mb-3">
        <div className="fw-bold mb-2">Pay via Link</div>
        <div className="d-flex gap-2">
          <input className="form-input flex-grow-1" placeholder="Enter link code (e.g., SRPL...)" value={payCode} onChange={(e) => setPayCode(e.target.value.toUpperCase())} />
          <button className="btn btn-primary" onClick={() => setPayLinkCode(payCode)}>Pay</button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-link-45deg"></i>
          <p>No payment links created yet</p>
        </div>
      ) : (
        links.map((l) => (
          <div key={l.id} className="card-modern d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">₹{l.amount}</div>
              {l.description && <div className="text-muted" style={{fontSize:'0.8rem'}}>{l.description}</div>}
              <div className="text-muted" style={{fontSize:'0.75rem'}}>Code: {l.code}</div>
              <span className={`badge-status ${l.status === 'ACTIVE' ? 'badge-success' : l.status === 'PAID' ? 'badge-info' : 'badge-warning'}`}>{l.status}</span>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-primary" onClick={() => { navigator.clipboard.writeText(l.url); toast.success('Copied!'); }}><i className="bi bi-clipboard"></i></button>
              {l.status === 'ACTIVE' && <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelLink(l.id)}><i className="bi bi-x-lg"></i></button>}
            </div>
          </div>
        ))
      )}

      {pinModal && payLinkCode && (
        <div className="modal-overlay" onClick={() => setPinModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Enter Transaction PIN</h3>
            <input className="form-input mb-3" type="password" maxLength={4} placeholder="4-digit PIN" onChange={(e) => setPinModal(e.target.value)} autoFocus />
            <div className="d-flex gap-2">
              <button className="btn btn-secondary flex-grow-1" onClick={() => setPinModal(null)}>Cancel</button>
              <button className="btn btn-primary flex-grow-1" onClick={handlePayLink} disabled={!pinModal || pinModal.length < 4}>Pay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}