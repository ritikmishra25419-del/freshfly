import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/notifications.css';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const navItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '🗂️', label: 'Portfolio', path: '/portfolio' },
  { icon: '🪪', label: 'Career Passport', path: '/passport' },
  { icon: '🗺️', label: 'Roadmap', path: null },
  { icon: '👥', label: 'Community', path: null },
  { icon: '💬', label: 'Messages', path: null },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

const themeColors: Record<string, string> = {
  ocean: '#2563EB', cosmic: '#7C3AED', mint: '#10B981',
  midnight: '#3B82F6', neon: '#FF0080',
};

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
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
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

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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
    <div className="notif-page">
      <div className="notif-sidebar">
        <div className="notif-sidebar-logo">FreshFly ✦</div>
        <div className="notif-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`notif-sidebar-item ${item.path === '/notifications' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="notif-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="notif-theme-label">Theme</div>
          <div className="notif-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="notif-theme-dot"
                style={{
                  background: color,
                  border: theme === t ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transform: theme === t ? 'scale(1.25)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          <button className="notif-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

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
                onClick={() => !notif.read && markAsRead(notif.id)}
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
    </div>
  );
}
