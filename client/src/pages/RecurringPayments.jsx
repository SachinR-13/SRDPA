import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getRecurringPayments, createRecurringPayment, toggleRecurringPayment, cancelRecurringPayment } from '../services/api';

export default function RecurringPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    receiverSRPayId: '', amount: '', description: '', frequency: 'MONTHLY',
    dayOfMonth: 1, startDate: new Date().toISOString().split('T')[0], endDate: '', maxPayments: ''
  });

  const fetchPayments = async () => {
    try {
      const res = await getRecurringPayments();
      setPayments(res.data.data || []);
    } catch (e) { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleCreate = async () => {
    try {
      const data = {
        ...form,
        amount: Number(form.amount),
        dayOfMonth: Number(form.dayOfMonth),
        maxPayments: form.maxPayments ? Number(form.maxPayments) : null,
        endDate: form.endDate || null,
      };
      await createRecurringPayment(data);
      toast.success('Recurring payment created!');
      setShowCreate(false);
      fetchPayments();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id) => {
    try { const res = await toggleRecurringPayment(id); toast.success(res.data.message); fetchPayments(); } catch (e) { toast.error('Failed'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this recurring payment?')) return;
    try { await cancelRecurringPayment(id); toast.success('Cancelled'); fetchPayments(); } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>AutoPay</h1>
        <p>Schedule recurring payments</p>
      </div>

      <button className="btn-primary-custom mb-3" onClick={() => setShowCreate(!showCreate)}>
        <i className="bi bi-plus-lg me-2"></i> New AutoPay
      </button>

      {showCreate && (
        <div className="card-modern mb-3">
          <input className="form-input mb-2" placeholder="Receiver SRPay ID" value={form.receiverSRPayId} onChange={(e) => setForm({...form, receiverSRPayId: e.target.value})} />
          <div className="input-group-custom mb-2"><span>₹</span><input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
          <input className="form-input mb-2" placeholder="Description (e.g., Rent)" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          <select className="form-input mb-2" value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})}>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          {form.frequency === 'MONTHLY' && (
            <input className="form-input mb-2" type="number" min={1} max={31} placeholder="Day of month (1-31)" value={form.dayOfMonth} onChange={(e) => setForm({...form, dayOfMonth: e.target.value})} />
          )}
          <input className="form-input mb-2" type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
          <input className="form-input mb-2" type="date" placeholder="End date (optional)" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
          <input className="form-input mb-2" type="number" placeholder="Max payments (optional)" value={form.maxPayments} onChange={(e) => setForm({...form, maxPayments: e.target.value})} />
          <button className="btn-primary-custom" onClick={handleCreate} disabled={!form.receiverSRPayId || !form.amount}>Create AutoPay</button>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-arrow-repeat"></i>
          <p>No recurring payments set up</p>
        </div>
      ) : (
        payments.map((p) => (
          <div key={p.id} className="card-modern">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-bold">{p.receiverName}</div>
                <div className="text-muted" style={{fontSize:'0.8rem'}}>{p.receiverSRPayId}</div>
                <div className="fw-bold mt-1">₹{p.amount} / {p.frequency}</div>
                {p.description && <div className="text-muted" style={{fontSize:'0.8rem'}}>{p.description}</div>}
                <div className="mt-1">
                  <span className={`badge-status ${p.status === 'ACTIVE' ? 'badge-success' : p.status === 'PAUSED' ? 'badge-warning' : 'badge-secondary'}`}>{p.status}</span>
                </div>
                <div className="text-muted" style={{fontSize:'0.75rem', marginTop:4}}>
                  Next: {new Date(p.nextPaymentDate).toLocaleDateString()} | Made: {p.totalPaymentsMade}
                  {p.maxPayments && ` / ${p.maxPayments}`}
                </div>
              </div>
              <div className="d-flex flex-column gap-1">
                {(p.status === 'ACTIVE' || p.status === 'PAUSED') && (
                  <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggle(p.id)}>
                    {p.status === 'ACTIVE' ? <i className="bi bi-pause"></i> : <i className="bi bi-play"></i>}
                  </button>
                )}
                {p.status !== 'CANCELLED' && p.status !== 'COMPLETED' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(p.id)}><i className="bi bi-x-lg"></i></button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}