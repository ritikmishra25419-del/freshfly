import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import '../styles/mobilenav.css';

const fresherMobileNav = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Apps', path: '/applications' },
  { icon: '🗂️', label: 'Portfolio', path: '/portfolio' },
  { icon: '🔔', label: 'Alerts', path: '/notifications' },
];

const clientMobileNav = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Apps', path: '/applications' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '🔔', label: 'Alerts', path: '/notifications' },
];

const mentorMobileNav = [
  { icon: '⭐', label: 'Reviews', path: '/mentor' },
  { icon: '📋', label: 'Apps', path: '/applications' },
  { icon: '👥', label: 'Community', path: '/community' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '🔔', label: 'Alerts', path: '/notifications' },
];

export default function MobileNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    user?.role === 'CLIENT' ? clientMobileNav :
    user?.role === 'MENTOR' ? mentorMobileNav :
    fresherMobileNav;

  return (
    <div className="mobile-nav">
      {navItems.map((item) => (
        <div
          key={item.label}
          className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}