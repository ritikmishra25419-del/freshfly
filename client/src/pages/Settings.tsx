import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme, themes } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/settings.css';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  tier: number | null;
  bio: string | null;
  education: string | null;
  hourlyRate: number | null;
  availability: boolean;
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

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    bio: '', education: '', hourlyRate: '', availability: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    api.get<ProfileData>('/profile/me')
      .then(res => {
        setProfile(res.data);
        setProfileForm({
          bio: res.data.bio || '',
          education: res.data.education || '',
          hourlyRate: res.data.hourlyRate?.toString() || '',
          availability: res.data.availability,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(''); setProfileError('');
    setSavingProfile(true);
    try {
      await api.put('/profile/me', {
        bio: profileForm.bio || null,
        education: profileForm.education || null,
        hourlyRate: profileForm.hourlyRate ? parseFloat(profileForm.hourlyRate) : null,
        availability: profileForm.availability,
      });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(''); setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="settings-loading">Loading settings...</div>;

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <div className="settings-sidebar-logo">FreshFly ✦</div>
        <div className="settings-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`settings-sidebar-item ${item.path === '/settings' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="settings-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="settings-theme-label">Theme</div>
          <div className="settings-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="settings-theme-dot"
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
          <button className="settings-logout-btn"
            onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="settings-main">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account, profile and preferences</p>

        <div className="settings-section">
          <div className="settings-section-title">👤 Account info</div>
          <div className="settings-info-card">
            <div className="settings-info-row">
              <span className="settings-info-label">Name</span>
              <span className="settings-info-value">{profile?.name}</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Email</span>
              <span className="settings-info-value">{profile?.email}</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Role</span>
              <span className="settings-info-value">{profile?.role}</span>
            </div>
            {profile?.role === 'FRESHER' && (
              <div className="settings-info-row">
                <span className="settings-info-label">Current tier</span>
                <span className="settings-info-value">Tier {profile?.tier}</span>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">✏️ Profile details</div>
          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="settings-form-group">
              <label>Bio</label>
              <textarea rows={3} placeholder="Tell clients about yourself..."
                value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
            </div>
            <div className="settings-form-group">
              <label>Education</label>
              <input type="text" placeholder="e.g. B.Tech CSE, XYZ University"
                value={profileForm.education}
                onChange={e => setProfileForm({ ...profileForm, education: e.target.value })} />
            </div>
            {profile?.role === 'FRESHER' && (
              <div className="settings-form-group">
                <label>Hourly rate (USD)</label>
                <input type="number" placeholder="e.g. 10"
                  value={profileForm.hourlyRate}
                  onChange={e => setProfileForm({ ...profileForm, hourlyRate: e.target.value })} />
              </div>
            )}
            <div className="settings-toggle-row">
              <div>
                <div className="settings-toggle-label">Available for work</div>
                <div className="settings-toggle-sub">
                  Clients can see you're open to new projects
                </div>
              </div>
              <div
                className={`settings-toggle ${profileForm.availability ? 'on' : 'off'}`}
                onClick={() => setProfileForm({ ...profileForm, availability: !profileForm.availability })}
              >
                <div className="settings-toggle-thumb" />
              </div>
            </div>
            {profileMsg && <div className="settings-success">{profileMsg}</div>}
            {profileError && <div className="settings-error">{profileError}</div>}
            <button type="submit" className="settings-save-btn" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile →'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">🎨 Appearance</div>
          <div className="settings-theme-grid">
            {themes.map(t => (
              <div
                key={t.id}
                className={`settings-theme-card ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id as Theme)}
              >
                <div className="settings-theme-dot-big"
                  style={{ background: t.color }} />
                <div className="settings-theme-name">{t.emoji} {t.label}</div>
                <div className="settings-theme-desc">{t.desc}</div>
                {theme === t.id && (
                  <div className="settings-theme-active-badge">✓ Active</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">🔒 Change password</div>
          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="settings-form-group">
              <label>Current password</label>
              <input type="password" placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required />
            </div>
            <div className="settings-form-group">
              <label>New password</label>
              <input type="password" placeholder="Min 6 characters"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required />
            </div>
            <div className="settings-form-group">
              <label>Confirm new password</label>
              <input type="password" placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required />
            </div>
            {passwordMsg && <div className="settings-success">{passwordMsg}</div>}
            {passwordError && <div className="settings-error">{passwordError}</div>}
            <button type="submit" className="settings-save-btn" disabled={savingPassword}>
              {savingPassword ? 'Changing...' : 'Change password →'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">🚪 Danger zone</div>
          <div className="settings-danger-card">
            <div className="settings-danger-info">
              <div className="settings-danger-label">Log out of FreshFly</div>
              <div className="settings-danger-sub">
                You will be redirected to the landing page.
              </div>
            </div>
            <button className="settings-danger-btn"
              onClick={() => { logout(); navigate('/'); }}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
