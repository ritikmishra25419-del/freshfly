import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/careerpassport.css';

interface PassportData {
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

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  techStack: string;
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  review: string;
  createdAt: string;
  mentor: { name: string };
  application: { job: { title: string } };
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

export default function CareerPassport() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams();

  const targetId = userId ? Number(userId) : user?.id;
  const isOwnPassport = !userId || Number(userId) === user?.id;

  const [profile, setProfile] = useState<PassportData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!targetId) return;

    Promise.all([
      isOwnPassport
        ? api.get('/profile/me')
        : api.get(`/profile/${targetId}`),
      api.get(`/portfolio/user/${targetId}`),
      api.get(`/reviews/fresher/${targetId}`),
      isOwnPassport
        ? api.get('/applications/my')
        : Promise.resolve({ data: { applications: [] } }),
    ]).then(([profileRes, portfolioRes, reviewsRes, appsRes]) => {
      setProfile(profileRes.data as PassportData);
      const portData = portfolioRes.data as { items: PortfolioItem[] };
      setPortfolio(portData.items);
      const reviewData = reviewsRes.data as { reviews: Review[]; avgRating: number };
      setReviews(reviewData.reviews);
      setAvgRating(reviewData.avgRating);
      const appsData = appsRes.data as { applications: { status: string }[] };
      setCompletedJobs(appsData.applications.filter(a => a.status === 'COMPLETED').length);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [targetId]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/passport/${targetId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tierColor: Record<number, string> = {
    1: '#22C55E', 2: '#7C3AED', 3: '#F59E0B',
  };

  if (loading) return <div className="cp-loading">Loading career passport...</div>;
  if (!profile) return null;

  return (
    <div className="cp-page">
      <div className="cp-sidebar">
        <div className="cp-sidebar-logo">FreshFly ✦</div>
        <div className="cp-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`cp-sidebar-item ${item.path === '/passport' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="cp-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="cp-theme-label">Theme</div>
          <div className="cp-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="cp-theme-dot"
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
          <button className="cp-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="cp-main">
        <div className="cp-passport-card">
          <div className="cp-banner" />
          <div className="cp-passport-body">
            <div className="cp-passport-top">
              <div className="cp-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="cp-passport-actions">
                {isOwnPassport && (
                  <button className="cp-share-btn" onClick={copyLink}>
                    {copied ? '✓ Link copied!' : '🔗 Share passport'}
                  </button>
                )}
                {isOwnPassport && (
                  <button className="cp-edit-btn" onClick={() => navigate('/profile')}>
                    ✏️ Edit profile
                  </button>
                )}
              </div>
            </div>

            <div className="cp-name">{profile.name}</div>
            <div className="cp-role-line">
              {profile.role}
              {profile.education && ` · ${profile.education}`}
            </div>

            <div className="cp-badges">
              <span className="cp-badge cp-badge-role">{profile.role}</span>
              {profile.tier && (
                <span className="cp-badge cp-badge-tier"
                  style={{ background: `${tierColor[profile.tier]}20`, color: tierColor[profile.tier] }}>
                  🏅 Tier {profile.tier}
                </span>
              )}
              {avgRating > 0 && (
                <span className="cp-badge cp-badge-rating">
                  ⭐ {avgRating.toFixed(1)} avg rating
                </span>
              )}
              <span className={`cp-badge ${profile.availability ? 'cp-badge-available' : 'cp-badge-unavailable'}`}>
                {profile.availability ? '🟢 Available' : '🔴 Unavailable'}
              </span>
            </div>

            {profile.bio && (
              <div className="cp-bio">{profile.bio}</div>
            )}

            <div className="cp-stats">
              <div className="cp-stat">
                <div className="cp-stat-num">{completedJobs}</div>
                <div className="cp-stat-label">Jobs completed</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-num">{portfolio.length}</div>
                <div className="cp-stat-label">Projects</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-num">{reviews.length}</div>
                <div className="cp-stat-label">Mentor reviews</div>
              </div>
              {profile.hourlyRate && (
                <div className="cp-stat">
                  <div className="cp-stat-num">${profile.hourlyRate}</div>
                  <div className="cp-stat-label">Per hour</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {portfolio.length > 0 && (
          <div className="cp-section">
            <div className="cp-section-title">🗂️ Projects</div>
            <div className="cp-projects-grid">
              {portfolio.map(item => (
                <div key={item.id} className="cp-project-card">
                  <div className="cp-project-icon">
                    {item.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="cp-project-title">{item.title}</div>
                  <div className="cp-project-desc">{item.description.slice(0, 80)}...</div>
                  <div className="cp-project-tech">
                    {item.techStack.split(',').slice(0, 3).map(t => (
                      <span key={t} className="cp-tech-tag">{t.trim()}</span>
                    ))}
                  </div>
                  <div className="cp-project-links">
                    {item.githubUrl && (
                      <a href={item.githubUrl} target="_blank" rel="noreferrer" className="cp-link-btn cp-github-btn">
                        GitHub →
                      </a>
                    )}
                    {item.liveUrl && (
                      <a href={item.liveUrl} target="_blank" rel="noreferrer" className="cp-link-btn cp-live-btn">
                        Live →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="cp-section">
            <div className="cp-section-title">⭐ Mentor Endorsements</div>
            <div className="cp-reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="cp-review-card">
                  <div className="cp-review-top">
                    <div>
                      <div className="cp-review-job">{review.application.job.title}</div>
                      <div className="cp-review-mentor">Reviewed by {review.mentor.name}</div>
                    </div>
                    <div className="cp-review-stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <div className="cp-review-text">"{review.review}"</div>
                  <div className="cp-review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {portfolio.length === 0 && reviews.length === 0 && (
          <div className="cp-empty-state">
            <div className="cp-empty-icon">🪪</div>
            <div className="cp-empty-title">
              {isOwnPassport ? 'Your passport is just getting started' : 'Nothing here yet'}
            </div>
            <div className="cp-empty-sub">
              {isOwnPassport
                ? 'Complete jobs, get mentor reviews, and add portfolio projects — they all show up here.'
                : 'This fresher is just getting started on FreshFly.'}
            </div>
            {isOwnPassport && (
              <div className="cp-empty-actions">
                <button className="cp-action-btn" onClick={() => navigate('/jobs')}>
                  Browse jobs →
                </button>
                <button className="cp-action-btn cp-action-btn-secondary"
                  onClick={() => navigate('/portfolio')}>
                  Add projects →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}