import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getContacts, addContact, toggleFavorite, updateNickname, deleteContact, syncContacts, searchUsers } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [nickname, setNickname] = useState('');
  const [selectedSrpay, setSelectedSrpay] = useState('');

  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      const res = await getContacts();
      setContacts(res.data.data || []);
    } catch (e) { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleSearch = async (q) => {
    setSearchQ(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await searchUsers(q);
      setSearchResults(res.data.data || res.data.users || []);
    } catch { setSearchResults([]); }
  };

  const handleAdd = async (srpayId) => {
    try {
      await addContact(srpayId, nickname);
      toast.success('Contact added!');
      setShowAdd(false);
      setSearchQ('');
      setSearchResults([]);
      setNickname('');
      fetchContacts();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add contact'); }
  };

  const handleToggleFav = async (id) => {
    try { await toggleFavorite(id); fetchContacts(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove contact?')) return;
    try { await deleteContact(id); toast.success('Contact removed'); fetchContacts(); } catch { toast.error('Failed'); }
  };

  const handleSync = async () => {
    try {
      const res = await syncContacts();
      toast.success(res.data.message || 'Contacts synced');
      fetchContacts();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Contacts</h1>
        <p>{contacts.length} contacts</p>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary flex-grow-1" onClick={() => setShowAdd(!showAdd)}><i className="bi bi-plus-lg me-1"></i> Add</button>
        <button className="btn btn-outline-primary" onClick={handleSync}><i className="bi bi-arrow-repeat"></i> Sync</button>
      </div>

      {showAdd && (
        <div className="card-modern mb-3">
          <input className="form-input mb-2" placeholder="Search by name, phone or SRPay ID" value={searchQ} onChange={(e) => handleSearch(e.target.value)} />
          {searchResults.length > 0 && (
            <div className="scroll-list mb-2" style={{ maxHeight: 200 }}>
              {searchResults.map((u) => (
                <div key={u._id || u.srpayId} className="contact-item" onClick={() => { setSelectedSrpay(u.srpayId); }}>
                  <div className="avatar">{u.fullName?.[0]}</div>
                  <div className="info">
                    <div className="name">{u.fullName}</div>
                    <div className="srpay">{u.srpayId}</div>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); handleAdd(u.srpayId); }}>Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-people"></i>
          <p>No contacts yet. Tap "Sync" to add from transactions.</p>
        </div>
      ) : (
        contacts.map((c) => (
          <div key={c.id} className="card-modern d-flex align-items-center justify-content-between">
            <div className="contact-item" style={{ flex: 1 }} onClick={() => {}}>
              <div className="avatar">{c.nickname?.[0] || c.fullName?.[0]}</div>
              <div className="info">
                <div className="name">{c.nickname || c.fullName}</div>
                <div className="srpay">{c.srpayId}</div>
              </div>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm" onClick={() => handleToggleFav(c.id)}>
                <i className={`bi ${c.isFavorite ? 'bi-star-fill text-warning' : 'bi-star'}`}></i>
              </button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/send-money', { state: { to: c.srpayId } })}>
                <i className="bi bi-send"></i>
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}