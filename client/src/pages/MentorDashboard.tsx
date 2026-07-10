import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/mentor.css';

interface Review {
  id: number;
  rating: number;
  review: string;
  createdAt: string;
  fresher: { id: number; name: string; profile: { tier: number | null } | null };
  application: { job: { id: number; title: string } };
}

interface PendingReview {
  id: number;
  fresher: { id: number; name: string; profile: { tier: number | null } | null };
  job: { id: number; title: string; skills: string };
  createdAt: string;
}

const navItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '⭐', label: 'Review Queue', path: '/mentor' },
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

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    if (user?.role !== 'MENTOR') {
      navigate('/profile');
      return;
    }

    api.get('/reviews/pending')
      .then(res => {
        const data = res.data as { applications: PendingReview[] };
        setPendingReviews(data.applications);
      })
      .catch(console.error)
      .finally(() => setLoadingPending(false));

    api.get('/reviews/my')
      .then(res => {
        const data = res.data as { reviews: Review[] };
        setMyReviews(data.reviews);
      })
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        applicationId: reviewing,
        rating,
        review: reviewText,
      });
      setSubmitted(prev => [...prev, reviewing]);
      setReviewing(null);
      setReviewText('');
      setRating(5);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingQueue = pendingReviews.filter(a => !submitted.includes(a.id));
  const totalReviewed = myReviews.length + submitted.length;
  const avgRating = myReviews.length > 0
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : '—';

  return (
    <div className="mentor-page">
      <div className="mentor-sidebar">
        <div className="mentor-sidebar-logo">FreshFly ✦</div>
        <div className="mentor-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`mentor-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{
                opacity: item.path ? 1 : 0.5,
                cursor: item.path ? 'pointer' : 'not-allowed',
              }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="mentor-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="mentor-theme-label">Theme</div>
          <div className="mentor-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="mentor-theme-dot"
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
          <button className="mentor-logout-btn"
            onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="mentor-main">
        <div className="mentor-header">
          <div>
            <h1 className="mentor-title">Mentor Dashboard</h1>
            <p className="mentor-subtitle">
              Welcome back, {user?.name?.split(' ')[0]} 👋 — you're helping freshers grow
            </p>
          </div>
          {pendingQueue.length > 0 && (
            <div className="mentor-pending-alert">
              🔔 {pendingQueue.length} review{pendingQueue.length > 1 ? 's' : ''} pending
            </div>
          )}
        </div>

        <div className="mentor-stats">
          <div className="mentor-stat-card">
            <div className="mentor-stat-num">{totalReviewed}</div>
            <div className="mentor-stat-label">Freshers reviewed</div>
            <div className="mentor-stat-icon">🎓</div>
          </div>
          <div className="mentor-stat-card">
            <div className="mentor-stat-num">{pendingQueue.length}</div>
            <div className="mentor-stat-label">Pending reviews</div>
            <div className="mentor-stat-icon">⏳</div>
          </div>
          <div className="mentor-stat-card">
            <div className="mentor-stat-num">{avgRating}</div>
            <div className="mentor-stat-label">Avg rating given</div>
            <div className="mentor-stat-icon">⭐</div>
          </div>
          <div className="mentor-stat-card">
            <div className="mentor-stat-num">
              {myReviews.filter(r => r.fresher.profile?.tier && r.fresher.profile.tier > 1).length}
            </div>
            <div className="mentor-stat-label">Freshers levelled up</div>
            <div className="mentor-stat-icon">🚀</div>
          </div>
        </div>

        <div className="mentor-tabs">
          <button
            className={`mentor-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending Reviews
            {pendingQueue.length > 0 && (
              <span className="mentor-tab-badge">{pendingQueue.length}</span>
            )}
          </button>
          <button
            className={`mentor-tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✅ Completed Reviews
          </button>
        </div>

        {reviewing !== null && (
          <div className="jobs-modal-overlay" onClick={() => setReviewing(null)}>
            <div className="jobs-modal" onClick={e => e.stopPropagation()}>
              <button className="jobs-modal-close" onClick={() => setReviewing(null)}>✕</button>
              <h2 className="jobs-modal-title">Write a review</h2>
              <p className="jobs-modal-sub">Your review appears on the fresher's career passport permanently.</p>
              <form onSubmit={handleSubmitReview} className="jobs-post-form">
                <div className="jobs-form-group">
                  <label>Rating</label>
                  <div className="mentor-stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span
                        key={s}
                        className={`mentor-star ${s <= rating ? 'active' : ''}`}
                        onClick={() => setRating(s)}
                      >★</span>
                    ))}
                    <span className="mentor-star-label">{rating}/5</span>
                  </div>
                </div>
                <div className="jobs-form-group">
                  <label>Review</label>
                  <textarea rows={4}
                    placeholder="Describe the fresher's work quality, communication, creativity, and professionalism..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    required />
                </div>
                {submitError && <div className="jobs-form-error">{submitError}</div>}
                <button type="submit" className="jobs-form-submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit review →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            {submitted.length > 0 && (
              <div className="jobs-success-banner" style={{ marginBottom: 20 }}>
                ✅ {submitted.length} review{submitted.length > 1 ? 's' : ''} submitted!
              </div>
            )}
            {loadingPending ? (
              <div className="mentor-loading">Loading pending reviews...</div>
            ) : pendingQueue.length === 0 ? (
              <div className="mentor-empty">
                <div className="mentor-empty-icon">🎉</div>
                <div className="mentor-empty-title">All caught up!</div>
                <div className="mentor-empty-sub">
                  No pending reviews right now. Check back when freshers complete more jobs.
                </div>
              </div>
            ) : (
              <div className="mentor-cards">
                {pendingQueue.map(app => (
                  <div key={app.id} className="mentor-review-card">
                    <div className="mentor-review-card-top">
                      <div className="mentor-fresher-info">
                        <div className="mentor-fresher-avatar">
                          {app.fresher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="mentor-fresher-name">{app.fresher.name}</div>
                          <div className="mentor-fresher-tier">
                            Tier {app.fresher.profile?.tier || 1} Fresher
                          </div>
                        </div>
                      </div>
                      <span className="mentor-needs-review-badge">Needs review</span>
                    </div>
                    <div className="mentor-job-title">{app.job.title}</div>
                    <div className="mentor-job-skills">{app.job.skills}</div>
                    <div className="mentor-card-footer">
                      <div className="mentor-completed-date">
                        Completed {new Date(app.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <button className="mentor-write-btn"
                        onClick={() => { setReviewing(app.id); setSubmitError(''); }}>
                        ⭐ Write review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            {loadingReviews ? (
              <div className="mentor-loading">Loading completed reviews...</div>
            ) : myReviews.length === 0 ? (
              <div className="mentor-empty">
                <div className="mentor-empty-icon">📝</div>
                <div className="mentor-empty-title">No reviews yet</div>
                <div className="mentor-empty-sub">Your submitted reviews will appear here.</div>
              </div>
            ) : (
              <div className="mentor-cards">
                {myReviews.map(review => (
                  <div key={review.id} className="mentor-review-card">
                    <div className="mentor-review-card-top">
                      <div className="mentor-fresher-info">
                        <div className="mentor-fresher-avatar">
                          {review.fresher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="mentor-fresher-name">{review.fresher.name}</div>
                          <div className="mentor-fresher-tier">
                            Tier {review.fresher.profile?.tier || 1} Fresher
                          </div>
                        </div>
                      </div>
                      <div className="mentor-given-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="mentor-job-title">{review.application.job.title}</div>
                    <div className="mentor-review-text">"{review.review}"</div>
                    <div className="mentor-card-footer">
                      <div className="mentor-completed-date">
                        Reviewed {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <span className="mentor-done-badge">✓ Submitted</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}