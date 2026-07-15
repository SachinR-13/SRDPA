import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications({ limit: 50 });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    setActionLoading(id);
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'WALLET': return 'bi-wallet2';
      case 'PAYMENT': return 'bi-credit-card';
      case 'TRANSFER': return 'bi-send';
      case 'QR': return 'bi-qr-code';
      default: return 'bi-bell';
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'WALLET': return { bg: '#DBEAFE', color: '#2563EB' };
      case 'PAYMENT': return { bg: '#D1FAE5', color: '#059669' };
      case 'TRANSFER': return { bg: '#EDE9FE', color: '#7C3AED' };
      case 'QR': return { bg: '#FEE2E2', color: '#DC2626' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="loader-gradient" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page-content fade-in">
      {/* Page Header with Gradient */}
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your activity</p>
        </div>
        <button
          className="btn-gradient btn-sm-gradient"
          style={{ width: 'auto' }}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || actionLoading === 'all'}
        >
          {actionLoading === 'all' ? (
            <span className="spinner-border spinner-border-sm" />
          ) : 'Mark All Read'}
        </button>
      </div>

      {/* Unread badge count */}
      {unreadCount > 0 && (
        <div
          className="d-flex align-items-center gap-2 mb-3 card-modern"
          style={{
            background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
            border: '1px solid #FECACA',
            padding: '10px 16px',
          }}
        >
          <span style={{ fontSize: 20 }}>🔔</span>
          <span style={{ color: '#991B1B', fontSize: 14, fontWeight: 600 }}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => {
            const iconStyle = getIconBg(n.type);
            return (
              <div
                key={n._id}
                className="card-modern p-3 mb-2"
                style={{
                  borderLeft: n.isRead ? '3px solid transparent' : '3px solid #667eea',
                  opacity: n.isRead ? 0.7 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: iconStyle.bg,
                      color: iconStyle.color,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${getIcon(n.type)}`}></i>
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <h6
                        className="fw-semibold mb-1"
                        style={{ fontSize: 14, color: '#111827', marginRight: 8 }}
                      >
                        {n.title}
                      </h6>
                      <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className="mb-0"
                      style={{
                        fontSize: 13,
                        color: '#6B7280',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <span
                        style={{
                          fontSize: 11,
                          color: '#667eea',
                          fontWeight: 600,
                          marginTop: 4,
                          display: 'inline-block',
                        }}
                      >
                        {actionLoading === n._id ? 'Marking...' : 'Tap to mark read'}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn btn-sm p-1"
                    style={{ color: '#9CA3AF', flexShrink: 0, border: 'none', background: 'none' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n._id);
                    }}
                    title="Delete"
                  >
                    <i className="bi bi-x-lg" style={{ fontSize: 12 }}></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}