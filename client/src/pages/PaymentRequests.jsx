import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getPendingRequests, getRequestHistory, requestMoney, splitBill, payRequest, declineRequest, cancelRequest } from '../services/api';

export default function PaymentRequests() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState({ sent: [], received: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [reqForm, setReqForm] = useState({ payerSRPayId: '', amount: '', description: '' });
  const [splitForm, setSplitForm] = useState({ participants: '', totalAmount: '', description: '' });
  const [pinModal, setPinModal] = useState(null);

  const fetchData = async () => {
    try {
      const [pRes, hRes] = await Promise.all([getPendingRequests(), getRequestHistory()]);
      setPending(pRes.data.data || { sent: [], received: [] });
      setHistory(hRes.data.data || []);
    } catch (e) { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async () => {
    try {
      await requestMoney(reqForm.payerSRPayId, Number(reqForm.amount), reqForm.description);
      toast.success('Request sent!');
      setShowRequest(false);
      setReqForm({ payerSRPayId: '', amount: '', description: '' });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleSplit = async () => {
    try {
      const participants = splitForm.participants.split(',').map(s => s.trim());
      await splitBill(participants, Number(splitForm.totalAmount), splitForm.description);
      toast.success('Bill split created!');
      setShowSplit(false);
      setSplitForm({ participants: '', totalAmount: '', description: '' });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handlePay = async (requestId) => {
    try {
      await payRequest(requestId, pinModal);
      toast.success('Payment successful!');
      setPinModal(null);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Payment failed'); }
  };

  const handleDecline = async (id) => {
    try { await declineRequest(id); toast.success('Declined'); fetchData(); } catch (e) { toast.error('Failed'); }
  };

  const handleCancel = async (id) => {
    try { await cancelRequest(id); toast.success('Cancelled'); fetchData(); } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Requests</h1>
        <p>Request & split money</p>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary flex-grow-1" onClick={() => setShowRequest(!showRequest)}><i className="bi bi-send-plus me-1"></i> Request</button>
        <button className="btn btn-outline-primary" onClick={() => setShowSplit(!showSplit)}><i className="bi bi-diagram-3 me-1"></i> Split</button>
      </div>

      {showRequest && (
        <div className="card-modern mb-3">
          <input className="form-input mb-2" placeholder="Payer's SRPay ID" value={reqForm.payerSRPayId} onChange={(e) => setReqForm({...reqForm, payerSRPayId: e.target.value})} />
          <div className="input-group-custom mb-2"><span>₹</span><input type="number" placeholder="Amount" value={reqForm.amount} onChange={(e) => setReqForm({...reqForm, amount: e.target.value})} /></div>
          <input className="form-input mb-2" placeholder="What for? (optional)" value={reqForm.description} onChange={(e) => setReqForm({...reqForm, description: e.target.value})} />
          <button className="btn-primary-custom" onClick={handleRequest}>Send Request</button>
        </div>
      )}

      {showSplit && (
        <div className="card-modern mb-3">
          <input className="form-input mb-2" placeholder="SRPay IDs (comma separated)" value={splitForm.participants} onChange={(e) => setSplitForm({...splitForm, participants: e.target.value})} />
          <div className="input-group-custom mb-2"><span>₹</span><input type="number" placeholder="Total Amount" value={splitForm.totalAmount} onChange={(e) => setSplitForm({...splitForm, totalAmount: e.target.value})} /></div>
          <input className="form-input mb-2" placeholder="Description" value={splitForm.description} onChange={(e) => setSplitForm({...splitForm, description: e.target.value})} />
          <button className="btn-primary-custom" onClick={handleSplit}>Split Bill</button>
        </div>
      )}

      <div className="d-flex gap-2 mb-3">
        <button className={`btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'pending' && (
        <>
          {pending.received.length > 0 && (
            <>
              <div className="section-title">Received Requests</div>
              {pending.received.map((r) => (
                <div key={r.id} className="card-modern d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{r.from?.name}</strong>
                    <div className="text-muted" style={{fontSize:'0.8rem'}}>{r.from?.srpayId}</div>
                    <div style={{fontWeight:700, color:'var(--primary)'}}>₹{r.amount}</div>
                    {r.description && <div className="text-muted" style={{fontSize:'0.8rem'}}>{r.description}</div>}
                  </div>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-success" onClick={() => setPinModal(r.id)}>Pay</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDecline(r.id)}>Decline</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {pending.sent.length > 0 && (
            <>
              <div className="section-title">Sent Requests</div>
              {pending.sent.map((r) => (
                <div key={r.id} className="card-modern d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{r.to?.name}</strong>
                    <div className="text-muted" style={{fontSize:'0.8rem'}}>{r.to?.srpayId}</div>
                    <div style={{fontWeight:700}}>₹{r.amount}</div>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(r.id)}>Cancel</button>
                </div>
              ))}
            </>
          )}

          {pending.received.length === 0 && pending.sent.length === 0 && (
            <div className="empty-state"><i className="bi bi-inbox"></i><p>No pending requests</p></div>
          )}
        </>
      )}

      {tab === 'history' && (
        history.length === 0 ? (
          <div className="empty-state"><i className="bi bi-clock-history"></i><p>No request history</p></div>
        ) : (
          history.map((r) => (
            <div key={r.id} className="card-modern d-flex justify-content-between align-items-center">
              <div>
                <div style={{fontWeight:600, fontSize:'0.9rem'}}>{r.requester} → {r.payer}</div>
                <div style={{fontWeight:700}}>₹{r.amount}</div>
                <span className={`badge-status ${r.status === 'PAID' ? 'badge-success' : r.status === 'DECLINED' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span>
              </div>
            </div>
          ))
        )
      )}

      {pinModal && (
        <div className="modal-overlay" onClick={() => setPinModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Enter Transaction PIN</h3>
            <input className="form-input mb-3" type="password" maxLength={4} placeholder="4-digit PIN" value={pinModal === true ? '' : ''} onChange={(e) => setPinModal(e.target.value)} autoFocus />
            <div className="d-flex gap-2">
              <button className="btn btn-secondary flex-grow-1" onClick={() => setPinModal(null)}>Cancel</button>
              <button className="btn btn-primary flex-grow-1" onClick={() => handlePay(pinModal)} disabled={!pinModal || pinModal.length < 4}>Pay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}