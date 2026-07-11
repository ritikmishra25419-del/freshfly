import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/profile.css';
import '../styles/dashboard.css';

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

interface Job {
  id: number;
  title: string;
  budget: number;
  tierRequired: number;
  skills: string;
  isRemote: boolean;
  client: { id: number; name: string };
}

interface Application {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  job: {
    id: number;
    title: string;
    budget: number;
    client: { name: string };
  };
}

interface ClientJob {
  id: number;
  title: string;
  budget: number;
  status: string;
  createdAt: string;
  tierRequired: number;
}

const navItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '🗂️', label: 'Portfolio', path: null },
  { icon: '🪪', label: 'Career Passport', path: null },
  { icon: '🗺️', label: 'Roadmap', path: null },
  { icon: '👥', label: 'Community', path: null },
  { icon: '💬', label: 'Messages', path: null },
  { icon: '🔔', label: 'Notifications', path: null },
  { icon: '⚙️', label: 'Settings', path: null },
];

const themeColors: Record<string, string> = {
  ocean: '#2563EB', cosmic: '#7C3AED', mint: '#10B981',
  midnight: '#3B82F6', neon: '#FF0080',
};

const statusConfig = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  ACCEPTED: { label: 'Accepted', color: '#22C55E', bg: '#DCFCE7' },
  REJECTED: { label: 'Rejected', color: '#EF4444', bg: '#FEF2F2' },
  COMPLETED: { label: 'Completed', color: '#7C3AED', bg: '#EEF0FF' },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [clientJobs, setClientJobs] = useState<ClientJob[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    api.get<ProfileData>('/profile/me')
      .then(res => {
        setProfile(res.data);
        if (res.data.role === 'MENTOR') {
          navigate('/mentor');
          return;
        }
        if (res.data.role === 'FRESHER') {
          api.get('/jobs').then(r => {
            const data = r.data as { jobs: Job[] | Record<string, Job> };
            const jobs = Array.isArray(data.jobs) ? data.jobs : Object.values(data.jobs);
            setRecommendedJobs(jobs.slice(0, 3));
          }).catch(console.error);

          api.get('/applications/my').then(r => {
            const data = r.data as { applications: Application[] };
            setRecentApplications(data.applications.slice(0, 3));
            setCompletedCount(data.applications.filter(a => a.status === 'COMPLETED').length);
          }).catch(console.error);

          api.get(`/reviews/fresher/${res.data.id}`).then(r => {
            const data = r.data as { avgRating: number };
            setAvgRating(data.avgRating);
          }).catch(console.error);
        }

        if (res.data.role === 'CLIENT') {
          api.get('/jobs/my').then(r => {
            const data = r.data as { jobs: ClientJob[] };
            setClientJobs(data.jobs.slice(0, 4));
          }).catch(console.error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="profile-loading">Loading your dashboard...</div>;
  if (!profile) return null;

  const tierPercent = ((profile.tier || 1) / 3) * 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const currentPath = '/profile';

  const tierColor: Record<number, string> = {
    1: '#22C55E', 2: '#7C3AED', 3: '#F59E0B',
  };

  return (
    <div className="profile-page">
      <div className="sidebar">
        <div className="sidebar-logo">FreshFly ✦</div>
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`sidebar-item ${item.path === currentPath ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{
                opacity: item.path ? 1 : 0.5,
                cursor: item.path ? 'pointer' : 'not-allowed',
              }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && (
                <span style={{
                  marginLeft: 'auto', fontSize: 9,
                  background: 'var(--border)', color: 'var(--text-muted)',
                  padding: '1px 6px', borderRadius: 100, fontWeight: 700,
                }}>Soon</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            color: 'var(--text-muted)', textTransform: 'uppercase',
            marginBottom: 8, paddingLeft: 4,
          }}>Theme</div>
          <div style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t.charAt(0).toUpperCase() + t.slice(1)}
                onClick={() => setTheme(t as Theme)}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: color, cursor: 'pointer',
                  border: theme === t ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  transform: theme === t ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: theme === t ? '0 0 0 2px var(--bg)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          <button className="logout-btn" style={{ width: '100%' }}
            onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="profile-main">
        <div className="dash-greeting-card">
          <div className="dash-greeting-left">
            <div className="dash-greeting-text">
              {greeting}, <span>{profile.name.split(' ')[0]}</span> 👋
            </div>
            <div className="dash-greeting-sub">
              {profile.role === 'FRESHER'
                ? `You're at Tier ${profile.tier} — keep completing jobs to level up!`
                : `Welcome back to your FreshFly dashboard.`}
            </div>
            {profile.role === 'FRESHER' && (
              <div className="dash-tier-progress">
                <div className="dash-tier-progress-top">
                  <span className="dash-tier-label">Tier {profile.tier} Progress</span>
                  <span className="dash-tier-pct">{Math.round(tierPercent)}%</span>
                </div>
                <div className="dash-tier-bar-wrap">
                  <div className="dash-tier-bar-fill" style={{ width: `${tierPercent}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="dash-greeting-right">
            <div className="dash-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="dash-role-badge">{profile.role}</div>
            {profile.role === 'FRESHER' && (
              <div className="dash-tier-badge">🏅 Tier {profile.tier}</div>
            )}
          </div>
        </div>

        {profile.role === 'FRESHER' && (
          <>
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="dash-stat-icon">📋</div>
                <div className="dash-stat-num">{recentApplications.length > 0 ? recentApplications.length : 0}</div>
                <div className="dash-stat-label">Applications sent</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">✅</div>
                <div className="dash-stat-num">{completedCount}</div>
                <div className="dash-stat-label">Jobs completed</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">⭐</div>
                <div className="dash-stat-num">{avgRating ? avgRating.toFixed(1) : '—'}</div>
                <div className="dash-stat-label">Avg mentor rating</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">🏅</div>
                <div className="dash-stat-num">Tier {profile.tier}</div>
                <div className="dash-stat-label">Current tier</div>
              </div>
            </div>

            <div className="dash-section">
              <div className="dash-section-header">
                <div className="dash-section-title">Recommended jobs for you</div>
                <button className="dash-see-all" onClick={() => navigate('/jobs')}>
                  See all →
                </button>
              </div>
              {recommendedJobs.length === 0 ? (
                <div className="dash-empty">
                  No jobs available right now — check back soon.
                </div>
              ) : (
                <div className="dash-jobs-grid">
                  {recommendedJobs.map(job => (
                    <div key={job.id} className="dash-job-card">
                      <div className="dash-job-top">
                        <div className="dash-job-avatar">
                          {job.client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="dash-job-client">{job.client.name}</div>
                          <div className="dash-job-verified">Verified ✓</div>
                        </div>
                        <div className="dash-job-tier" style={{
                          background: `${tierColor[job.tierRequired]}20`,
                          color: tierColor[job.tierRequired],
                        }}>
                          T{job.tierRequired}
                        </div>
                      </div>
                      <div className="dash-job-title">{job.title}</div>
                      <div className="dash-job-skills">
                        {job.skills.split(',').slice(0, 3).map(s => (
                          <span key={s} className="dash-job-skill">{s.trim()}</span>
                        ))}
                      </div>
                      <div className="dash-job-bottom">
                        <div className="dash-job-budget">₹{job.budget.toLocaleString()}</div>
                        <button className="dash-apply-btn"
                          onClick={() => navigate('/jobs')}>
                          Apply →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-section">
              <div className="dash-section-header">
                <div className="dash-section-title">Recent applications</div>
                <button className="dash-see-all" onClick={() => navigate('/applications')}>
                  See all →
                </button>
              </div>
              {recentApplications.length === 0 ? (
                <div className="dash-empty">
                  You haven't applied to any jobs yet.{' '}
                  <span className="dash-empty-link" onClick={() => navigate('/jobs')}>
                    Browse jobs →
                  </span>
                </div>
              ) : (
                <div className="dash-apps-list">
                  {recentApplications.map(app => {
                    const sc = statusConfig[app.status];
                    return (
                      <div key={app.id} className="dash-app-row">
                        <div className="dash-app-info">
                          <div className="dash-app-title">{app.job.title}</div>
                          <div className="dash-app-client">by {app.job.client.name} · ₹{app.job.budget.toLocaleString()}</div>
                        </div>
                        <span className="dash-app-status" style={{ color: sc.color, background: sc.bg }}>
                          {sc.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {profile.role === 'CLIENT' && (
          <>
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="dash-stat-icon">💼</div>
                <div className="dash-stat-num">{clientJobs.length}</div>
                <div className="dash-stat-label">Jobs posted</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">✅</div>
                <div className="dash-stat-num">
                  {clientJobs.filter(j => j.status === 'OPEN').length}
                </div>
                <div className="dash-stat-label">Active listings</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">🤝</div>
                <div className="dash-stat-num">
                  {clientJobs.filter(j => j.status === 'CLOSED').length}
                </div>
                <div className="dash-stat-label">Closed jobs</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">🌟</div>
                <div className="dash-stat-num">Tier 1–3</div>
                <div className="dash-stat-label">Fresher tiers available</div>
              </div>
            </div>

            <div className="dash-section">
              <div className="dash-section-header">
                <div className="dash-section-title">Your job listings</div>
                <button className="dash-post-btn" onClick={() => navigate('/jobs')}>
                  + Post a job
                </button>
              </div>
              {clientJobs.length === 0 ? (
                <div className="dash-empty">
                  You haven't posted any jobs yet.{' '}
                  <span className="dash-empty-link" onClick={() => navigate('/jobs')}>
                    Post your first job →
                  </span>
                </div>
              ) : (
                <div className="dash-client-jobs">
                  {clientJobs.map(job => (
                    <div key={job.id} className="dash-client-job-row">
                      <div className="dash-client-job-info">
                        <div className="dash-app-title">{job.title}</div>
                        <div className="dash-app-client">
                          ₹{job.budget.toLocaleString()} · Tier {job.tierRequired} ·{' '}
                          {new Date(job.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short',
                          })}
                        </div>
                      </div>
                      <div className="dash-client-job-right">
                        <span className="dash-job-status-badge"
                          style={{
                            background: job.status === 'OPEN' ? '#DCFCE7' : '#F3F4F6',
                            color: job.status === 'OPEN' ? '#166534' : '#6B7280',
                          }}>
                          {job.status === 'OPEN' ? '🟢 Open' : '⚫ Closed'}
                        </span>
                        <button className="dash-see-all"
                          onClick={() => navigate('/applications')}>
                          View applicants →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}