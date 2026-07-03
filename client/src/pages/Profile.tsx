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

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      .catch(() => setError('Failed to load profile.'))
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
    } catch {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return null;

  const roleColors: Record<string, string> = {
    FRESHER: '#6c47ff',
    CLIENT: '#0ea5e9',
    MENTOR: '#10b981',
  };

  return (
    <div className="profile-container">
      <div className="profile-card">

        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-identity">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-badges">
              <span className="badge role-badge" style={{ background: roleColors[profile.role] }}>
                {profile.role}
              </span>
              {profile.role === 'FRESHER' && (
                <span className="badge tier-badge">
                  Tier {profile.tier}
                </span>
              )}
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>

        {profile.role === 'FRESHER' && (
          <div className="tier-banner">
            <div className="tier-info">
              <span className="tier-title">Tier {profile.tier} Fresher</span>
              <span className="tier-sub">Complete jobs and get mentor reviews to level up</span>
            </div>
            <div className="tier-dots">
              {[1, 2, 3].map(t => (
                <div key={t} className={	ier-dot + (t <= (profile.tier || 1) ? 'active' : '')} />
              ))}
            </div>
          </div>
        )}

        <div className="profile-body">
          {editing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell clients about yourself..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Education</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE, XYZ University"
                  value={form.education}
                  onChange={e => setForm({ ...form, education: e.target.value })}
                />
              </div>
              {profile.role === 'FRESHER' && (
                <div className="form-group">
                  <label>Hourly Rate (USD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={form.hourlyRate}
                    onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                  />
                </div>
              )}
              <div className="edit-actions">
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button className="btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Bio</span>
                <span className="detail-value">{profile.bio || <em>Not set</em>}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Education</span>
                <span className="detail-value">{profile.education || <em>Not set</em>}</span>
              </div>
              {profile.role === 'FRESHER' && (
                <div className="detail-row">
                  <span className="detail-label">Hourly Rate</span>
                  <span className="detail-value">
                    {profile.hourlyRate ? USD /hr : <em>Not set</em>}
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Availability</span>
                <span className={vailability + (profile.availability ? 'open' : 'closed')}>
                  {profile.availability ? 'Available for work' : 'Not available'}
                </span>
              </div>
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
