import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import '../styles/notifications.css';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcon: Record<string, string> = {
  APPLICATION_ACCEPTED: '🎉',
  APPLICATION_REJECTED: '😔',
  APPLICATION_COMPLETED: '✅',
  MENTOR_REVIEW: '⭐',
  TIER_UPGRADE: '🚀',
  NEW_APPLICANT: '👤',
  JOB_POSTED: '💼',
};

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    api.get('/notifications')
      .then(res => {
        const data = res.data as { notifications: Notification[]; unreadCount: number };
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: number, link: string | null) => {
  try {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (link) navigate(link);
  } catch (err) {
    console.error(err);
  }
};

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read/all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <PageLayout>
      <div className="notif-main">
        <div className="notif-header">
          <div>
            <h1 className="notif-title">
              Notifications
              {unreadCount > 0 && (
                <span className="notif-count-badge">{unreadCount} new</span>
              )}
            </h1>
            <p className="notif-subtitle">Stay up to date with your activity on FreshFly</p>
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn"
              onClick={markAllAsRead} disabled={markingAll}>
              {markingAll ? 'Marking...' : '✓ Mark all as read'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="notif-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <div className="notif-empty-title">No notifications yet</div>
            <div className="notif-empty-sub">
              Apply to jobs, get reviews, and complete projects — notifications will appear here.
            </div>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'unread' : ''}`}
               onClick={() => markAsRead(notif.id, notif.link)}
              >
                <div className="notif-icon">
                  {typeIcon[notif.type] || '🔔'}
                </div>
                <div className="notif-content">
                  <div className="notif-item-title">{notif.title}</div>
                  <div className="notif-item-message">{notif.message}</div>
                  <div className="notif-item-time">{timeAgo(notif.createdAt)}</div>
                </div>
                {!notif.read && <div className="notif-unread-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}