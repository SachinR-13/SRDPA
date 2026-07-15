import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getBankAccounts, addBankAccount, setPrimaryBank, deleteBankAccount, verifyBankAccount, withdrawToBank } from '../services/api';

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', accountType: 'SAVINGS' });
  const [withdrawForm, setWithdrawForm] = useState({ accountId: '', amount: '', transactionPin: '' });
  const [showWithdraw, setShowWithdraw] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await getBankAccounts();
      setAccounts(res.data.data || []);
    } catch (e) { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleAdd = async () => {
    try {
      await addBankAccount(form);
      toast.success('Bank account added!');
      setShowAdd(false);
      setForm({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', accountType: 'SAVINGS' });
      fetchAccounts();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add'); }
  };

  const handleVerify = async (id) => {
    try {
      await verifyBankAccount(id);
      toast.success('Account verified!');
      fetchAccounts();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleSetPrimary = async (id) => {
    try { await setPrimaryBank(id); toast.success('Primary updated'); fetchAccounts(); } catch (e) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this account?')) return;
    try { await deleteBankAccount(id); toast.success('Deleted'); fetchAccounts(); } catch (e) { toast.error('Failed'); }
  };

  const handleWithdraw = async () => {
    try {
      const res = await withdrawToBank(withdrawForm.accountId, Number(withdrawForm.amount), withdrawForm.transactionPin);
      toast.success(res.data.message || 'Withdrawal successful!');
      setShowWithdraw(false);
      setWithdrawForm({ accountId: '', amount: '', transactionPin: '' });
      fetchAccounts();
    } catch (e) { toast.error(e.response?.data?.message || 'Withdrawal failed'); }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Bank Accounts</h1>
        <p>Link & manage your bank accounts</p>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary flex-grow-1" onClick={() => setShowAdd(!showAdd)}><i className="bi bi-plus-lg me-1"></i> Add Bank</button>
        <button className="btn btn-outline-primary" onClick={() => setShowWithdraw(!showWithdraw)}><i className="bi bi-box-arrow-up me-1"></i> Withdraw</button>
      </div>

      {showAdd && (
        <div className="card-modern mb-3">
          <input className="form-input mb-2" placeholder="Account Holder Name" value={form.accountHolderName} onChange={(e) => setForm({...form, accountHolderName: e.target.value})} />
          <input className="form-input mb-2" placeholder="Bank Name" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} />
          <input className="form-input mb-2" placeholder="Account Number" value={form.accountNumber} onChange={(e) => setForm({...form, accountNumber: e.target.value})} />
          <input className="form-input mb-2" placeholder="IFSC Code" value={form.ifscCode} onChange={(e) => setForm({...form, ifscCode: e.target.value})} />
          <select className="form-input mb-2" value={form.accountType} onChange={(e) => setForm({...form, accountType: e.target.value})}>
            <option value="SAVINGS">Savings</option>
            <option value="CURRENT">Current</option>
            <option value="SALARY">Salary</option>
          </select>
          <button className="btn-primary-custom" onClick={handleAdd}>Add Bank Account</button>
        </div>
      )}

      {showWithdraw && (
        <div className="card-modern mb-3">
          <select className="form-input mb-2" value={withdrawForm.accountId} onChange={(e) => setWithdrawForm({...withdrawForm, accountId: e.target.value})}>
            <option value="">Select account</option>
            {accounts.filter(a => a.isVerified).map(a => (
              <option key={a.id} value={a.id}>{a.bankName} - {a.accountNumber}</option>
            ))}
          </select>
          <div className="input-group-custom mb-2">
            <span>₹</span>
            <input type="number" placeholder="Amount" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
          </div>
          <input className="form-input mb-2" type="password" maxLength={4} placeholder="Transaction PIN" value={withdrawForm.transactionPin} onChange={(e) => setWithdrawForm({...withdrawForm, transactionPin: e.target.value})} />
          <button className="btn-primary-custom" onClick={handleWithdraw} disabled={!withdrawForm.accountId || !withdrawForm.amount || !withdrawForm.transactionPin}>Withdraw to Bank</button>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bank"></i>
          <p>No bank accounts linked</p>
        </div>
      ) : (
        accounts.map((acc) => (
          <div key={acc.id} className="card-modern">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong>{acc.bankName}</strong>
                {acc.isPrimary && <span className="badge-status badge-success ms-2">Primary</span>}
                {acc.isVerified ? <span className="badge-status badge-info ms-1">Verified</span> : <span className="badge-status badge-warning ms-1">Unverified</span>}
              </div>
            </div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{acc.accountHolderName}</div>
            <div style={{ fontSize: '0.9rem' }}>{acc.accountNumber}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{acc.ifscCode}</div>
            <div className="d-flex gap-2 mt-2">
              {!acc.isPrimary && <button className="btn btn-sm btn-outline-primary" onClick={() => handleSetPrimary(acc.id)}>Set Primary</button>}
              {!acc.isVerified && <button className="btn btn-sm btn-outline-success" onClick={() => handleVerify(acc.id)}>Verify</button>}
              {!acc.isPrimary && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(acc.id)}>Remove</button>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}