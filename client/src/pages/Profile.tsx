import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import '../styles/profile.css';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: 'FRESHER' | 'CLIENT' | 'MENTOR';
  tier: number | null;
  bio: string | null;
  education: string | null;
  hourlyRate: number | null;
  availability: boolean;
}

const navItems = [
  { icon: '🏠', label: 'Home' },
  { icon: '💼', label: 'Jobs' },
  { icon: '📋', label: 'Applications' },
  { icon: '🗂️', label: 'Portfolio' },
  { icon: '🪪', label: 'Career Passport' },
  { icon: '🗺️', label: 'Roadmap' },
  { icon: '👥', label: 'Community' },
  { icon: '💬', label: 'Messages' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '⚙️', label: 'Settings' },
];

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', education: '', hourlyRate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ProfileData>('/profile/me')
      .then(res => {
        setProfile(res.data);
        setForm({
          bio: res.data.bio || '',
          education: res.data.education || '',
          hourlyRate: res.data.hourlyRate?.toString() || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile/me', {
        bio: form.bio || null,
        education: form.education || null,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
      });
      setProfile(prev => prev ? { ...prev, ...res.data.profile } : prev);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading your profile...</div>;
  if (!profile) return null;

  const tierPercent = ((profile.tier || 1) / 3) * 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="profile-page">
      <div className="sidebar">
        <div className="sidebar-logo">FreshFly ✦</div>
        <div className="sidebar-nav">
          {navItems.map((item, i) => (
            <div key={item.label} className={`sidebar-item ${i === 0 ? 'active' : ''}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 24px' }}>
          <button className="logout-btn" style={{ width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="profile-main">
        <div className="profile-greeting">
          {greeting}, <span>{profile.name.split(' ')[0]}</span> 👋
        </div>
        <div className="profile-sub">
          {profile.role === 'FRESHER'
            ? `You're at Tier ${profile.tier} — keep completing jobs to level up!`
            : `Welcome back to your FreshFly dashboard.`}
        </div>

        <div className="passport-card">
          <div className="passport-banner" />
          <div className="passport-info">
            <div className="passport-top">
              <div className="passport-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="passport-badges">
                <span className="badge-role">{profile.role}</span>
                {profile.role === 'FRESHER' && (
                  <span className="badge-tier">🏅 Tier {profile.tier}</span>
                )}
              </div>
            </div>
            <div className="passport-name">{profile.name}</div>
            <div className="passport-email">{profile.email}</div>

            {profile.role === 'FRESHER' && (
              <div className="tier-progress-card">
                <div className="tier-progress-top">
                  <div>
                    <div className="tier-progress-title">Tier {profile.tier} — Rising Fresher</div>
                    <div className="tier-progress-sub">Complete jobs + get mentor reviews to level up</div>
                  </div>
                  <div className="tier-dots">
                    {[1, 2, 3].map(t => (
                      <div key={t} className={`tier-dot ${t <= (profile.tier || 1) ? 'active' : ''}`} />
                    ))}
                  </div>
                </div>
                <div className="tier-bar-wrap">
                  <div className="tier-bar-fill" style={{ width: `${tierPercent}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="details-card">
          <div className="details-card-title">
            Profile details
            {!editing && <button className="edit-btn" onClick={() => setEditing(true)}>Edit profile</button>}
          </div>

          {editing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Bio</label>
                <textarea rows={3} placeholder="Tell clients about yourself..."
                  value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Education</label>
                <input type="text" placeholder="e.g. B.Tech CSE, XYZ University"
                  value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} />
              </div>
              {profile.role === 'FRESHER' && (
                <div className="form-group">
                  <label>Hourly rate (USD)</label>
                  <input type="number" placeholder="e.g. 10"
                    value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
                </div>
              )}
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Bio</span>
                <span className={`detail-value ${!profile.bio ? 'empty' : ''}`}>
                  {profile.bio || 'Not set yet — add a bio to attract clients'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Education</span>
                <span className={`detail-value ${!profile.education ? 'empty' : ''}`}>
                  {profile.education || 'Not set'}
                </span>
              </div>
              {profile.role === 'FRESHER' && (
                <div className="detail-row">
                  <span className="detail-label">Hourly rate</span>
                  <span className={`detail-value ${!profile.hourlyRate ? 'empty' : ''}`}>
                    {profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not set'}
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Availability</span>
                <span className={`avail-pill ${profile.availability ? 'open' : 'closed'}`}>
                  {profile.availability ? '🟢 Available for work' : '🔴 Not available'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}