import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';

const themeColors: Record<string, string> = {
  ocean: '#2563EB',
  cosmic: '#7C3AED',
  mint: '#10B981',
  midnight: '#3B82F6',
  neon: '#FF0080',
};

const fresherNavItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '🗂️', label: 'Portfolio', path: '/portfolio' },
  { icon: '🪪', label: 'Career Passport', path: '/passport' },
  { icon: '🗺️', label: 'Roadmap', path: '/roadmap' },
  { icon: '👥', label: 'Community', path: '/community' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

const clientNavItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '👥', label: 'Community', path: '/community' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

const mentorNavItems = [
  { icon: '⭐', label: 'Review Queue', path: '/mentor' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '🗺️', label: 'Roadmap', path: '/roadmap' },
  { icon: '👥', label: 'Community', path: '/community' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    user?.role === 'CLIENT' ? clientNavItems :
    user?.role === 'MENTOR' ? mentorNavItems :
    fresherNavItems;

  return (
    <div className="shared-sidebar">
      <div className="shared-sidebar-logo">FreshFly ✦</div>

      <div className="shared-sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`shared-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="shared-sidebar-bottom">
        <div className="shared-theme-section">
          <div className="shared-theme-label">Theme</div>
          <div className="shared-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div
                key={t}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
                onClick={() => setTheme(t as Theme)}
                className="shared-theme-dot"
                style={{
                  background: color,
                  border: theme === t
                    ? '2px solid var(--text-primary)'
                    : '2px solid transparent',
                  transform: theme === t ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: theme === t ? '0 0 0 2px var(--bg)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <button
          className="shared-logout-btn"
          onClick={() => { logout(); navigate('/'); }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}