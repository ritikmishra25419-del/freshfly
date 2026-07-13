import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/applications.css';

interface Application {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  coverLetter: string | null;
  createdAt: string;
  job: {
    id: number;
    title: string;
    budget: number;
    skills: string;
    client: { id: number; name: string };
  };
  review: {
    id: number;
    rating: number;
    review: string;
    mentor: { name: string };
  } | null;
}

interface JobApplication {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  coverLetter: string | null;
  createdAt: string;
  fresher: {
    id: number;
    name: string;
    email: string;
    profile: { tier: number | null; bio: string | null; hourlyRate: number | null } | null;
  };
  review: { id: number } | null;
}

interface PendingReview {
  id: number;
  fresher: {
    id: number;
    name: string;
    profile: { tier: number | null } | null;
  };
  job: {
    id: number;
    title: string;
    skills: string;
  };
  createdAt: string;
}

const navItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
 { icon: '🗂️', label: 'Portfolio', path: '/portfolio' },
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

function MentorView() {
  const [queue, setQueue] = useState<PendingReview[]>([]);
  const [myReviews, setMyReviews] = useState<{
    id: number;
    rating: number;
    review: string;
    createdAt: string;
    fresher: { id: number; name: string; profile: { tier: number | null } | null };
    application: { job: { id: number; title: string } };
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    Promise.all([
      api.get('/reviews/pending'),
      api.get('/reviews/my'),
    ]).then(([pendingRes, myRes]) => {
      const pendingData = pendingRes.data as { applications: PendingReview[] };
      const myData = myRes.data as { reviews: typeof myReviews };
      setQueue(pendingData.applications);
      setMyReviews(myData.reviews);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div className="apps-loading">Loading reviews...</div>;

  const pendingQueue = queue.filter(a => !submitted.includes(a.id));

  return (
    <div>
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
                  placeholder="Describe the fresher's work quality, communication, and professionalism..."
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

      <div className="mentor-tabs" style={{ marginBottom: 20 }}>
        <button
          className={`mentor-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending
          {pendingQueue.length > 0 && (
            <span className="mentor-tab-badge">{pendingQueue.length}</span>
          )}
        </button>
        <button
          className={`mentor-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({myReviews.length + submitted.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          {submitted.length > 0 && (
            <div className="jobs-success-banner" style={{ marginBottom: 16 }}>
              ✅ {submitted.length} review{submitted.length > 1 ? 's' : ''} submitted!
            </div>
          )}
          {pendingQueue.length === 0 ? (
            <div className="apps-empty">
              <div className="apps-empty-icon">🎉</div>
              <div className="apps-empty-title">All caught up!</div>
              <div className="apps-empty-sub">No pending reviews right now.</div>
            </div>
          ) : (
            <div className="apps-list">
              {pendingQueue.map(app => (
                <div key={app.id} className="app-card">
                  <div className="app-card-top">
                    <div className="app-fresher-info">
                      <div className="app-fresher-avatar">
                        {app.fresher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="app-fresher-name">{app.fresher.name}</div>
                        <div className="app-fresher-meta">
                          Tier {app.fresher.profile?.tier || 1} Fresher
                        </div>
                      </div>
                    </div>
                    <span className="app-status-badge" style={{ color: '#7C3AED', background: '#EEF0FF' }}>
                      Needs review
                    </span>
                  </div>
                  <div className="app-job-title">{app.job.title}</div>
                  <div className="app-skills" style={{ marginBottom: 14 }}>{app.job.skills}</div>
                  <div className="app-date" style={{ marginBottom: 12 }}>
                    Completed {new Date(app.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                  <button className="app-btn-complete"
                    onClick={() => { setReviewing(app.id); setSubmitError(''); }}>
                    ⭐ Write review
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'completed' && (
        <>
          {myReviews.length === 0 && submitted.length === 0 ? (
            <div className="apps-empty">
              <div className="apps-empty-icon">📝</div>
              <div className="apps-empty-title">No reviews yet</div>
              <div className="apps-empty-sub">Your submitted reviews will appear here.</div>
            </div>
          ) : (
            <div className="apps-list">
              {myReviews.map(review => (
                <div key={review.id} className="app-card">
                  <div className="app-card-top">
                    <div className="app-fresher-info">
                      <div className="app-fresher-avatar">
                        {review.fresher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="app-fresher-name">{review.fresher.name}</div>
                        <div className="app-fresher-meta">
                          Tier {review.fresher.profile?.tier || 1} Fresher
                        </div>
                      </div>
                    </div>
                    <div className="app-review-stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <div className="app-job-title">{review.application.job.title}</div>
                  <div className="app-cover-letter">
                    <div className="app-cover-label">Your review</div>
                    <div className="app-cover-text">"{review.review}"</div>
                  </div>
                  <div className="app-date">
                    Reviewed {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Applications() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [selectedJobApps, setSelectedJobApps] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [myJobs, setMyJobs] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === 'FRESHER') {
      api.get('/applications/my')
        .then(res => {
          const data = res.data as { applications: Application[] };
          setMyApplications(data.applications);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (user?.role === 'CLIENT') {
      api.get('/jobs/my')
        .then(res => {
          const data = res.data as { jobs: { id: number; title: string }[] };
          setMyJobs(data.jobs);
          if (data.jobs.length > 0) {
            loadJobApplications(data.jobs[0].id);
            setSelectedJobId(data.jobs[0].id);
          } else {
            setLoading(false);
          }
        })
        .catch(console.error);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadJobApplications = (jobId: number) => {
    setLoading(true);
    setSelectedJobId(jobId);
    api.get(`/applications/job/${jobId}`)
      .then(res => {
        const data = res.data as { applications: JobApplication[] };
        setSelectedJobApps(data.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateStatus = async (appId: number, status: string) => {
    setUpdating(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setSelectedJobApps(prev =>
        prev.map(a => a.id === appId ? { ...a, status: status as any } : a)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="apps-page">
      <div className="apps-sidebar">
        <div className="apps-sidebar-logo">FreshFly ✦</div>
        <div className="apps-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`apps-sidebar-item ${item.path === '/applications' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="apps-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="apps-theme-label">Theme</div>
          <div className="apps-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="apps-theme-dot"
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
          <button className="apps-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="apps-main">
        <h1 className="apps-title">Applications</h1>
        <p className="apps-subtitle">
          {user?.role === 'FRESHER'
            ? 'Track all the jobs you have applied to'
            : user?.role === 'MENTOR'
            ? 'Review completed work and vouch for freshers'
            : 'Review applicants for your job listings'}
        </p>

        {user?.role === 'FRESHER' && (
          loading ? (
            <div className="apps-loading">Loading applications...</div>
          ) : myApplications.length === 0 ? (
            <div className="apps-empty">
              <div className="apps-empty-icon">📋</div>
              <div className="apps-empty-title">No applications yet</div>
              <div className="apps-empty-sub">Browse jobs and apply to get started.</div>
              <button className="apps-browse-btn" onClick={() => navigate('/jobs')}>
                Browse jobs →
              </button>
            </div>
          ) : (
            <div className="apps-list">
              {myApplications.map(app => {
                const sc = statusConfig[app.status];
                return (
                  <div key={app.id} className="app-card">
                    <div className="app-card-top">
                      <div>
                        <div className="app-job-title">{app.job.title}</div>
                        <div className="app-client-name">by {app.job.client.name}</div>
                      </div>
                      <span className="app-status-badge" style={{ color: sc.color, background: sc.bg }}>
                        {sc.label}
                      </span>
                    </div>

                    <div className="app-job-meta">
                      <span className="app-budget">₹{app.job.budget.toLocaleString()}</span>
                      <span className="app-skills">{app.job.skills}</span>
                    </div>

                    {app.coverLetter && (
                      <div className="app-cover-letter">
                        <div className="app-cover-label">Your cover letter</div>
                        <div className="app-cover-text">{app.coverLetter}</div>
                      </div>
                    )}

                    {app.review && (
                      <div className="app-review-card">
                        <div className="app-review-header">
                          <span className="app-review-label">Mentor review</span>
                          <span className="app-review-stars">
                            {'★'.repeat(app.review.rating)}{'☆'.repeat(5 - app.review.rating)}
                          </span>
                        </div>
                        <div className="app-review-text">{app.review.review}</div>
                        <div className="app-review-mentor">— {app.review.mentor.name}</div>
                      </div>
                    )}

                    <div className="app-date">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {user?.role === 'MENTOR' && (
          <MentorView />
        )}

        {user?.role === 'CLIENT' && (
          <div className="apps-client-view">
            {myJobs.length === 0 ? (
              <div className="apps-empty">
                <div className="apps-empty-icon">💼</div>
                <div className="apps-empty-title">No jobs posted yet</div>
                <div className="apps-empty-sub">Post a job to start receiving applications.</div>
                <button className="apps-browse-btn" onClick={() => navigate('/jobs')}>
                  Post a job →
                </button>
              </div>
            ) : (
              <>
                <div className="apps-job-tabs">
                  {myJobs.map(job => (
                    <button
                      key={job.id}
                      className={`apps-job-tab ${selectedJobId === job.id ? 'active' : ''}`}
                      onClick={() => loadJobApplications(job.id)}
                    >
                      {job.title}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="apps-loading">Loading applicants...</div>
                ) : selectedJobApps.length === 0 ? (
                  <div className="apps-empty" style={{ marginTop: 40 }}>
                    <div className="apps-empty-icon">👀</div>
                    <div className="apps-empty-title">No applicants yet</div>
                    <div className="apps-empty-sub">Freshers will appear here when they apply.</div>
                  </div>
                ) : (
                  <div className="apps-list">
                    {selectedJobApps.map(app => {
                      const sc = statusConfig[app.status];
                      return (
                        <div key={app.id} className="app-card">
                          <div className="app-card-top">
                            <div className="app-fresher-info">
                              <div className="app-fresher-avatar">
                                {app.fresher.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="app-fresher-name">{app.fresher.name}</div>
                                <div className="app-fresher-meta">
                                  Tier {app.fresher.profile?.tier || 1}
                                  {app.fresher.profile?.hourlyRate && ` · $${app.fresher.profile.hourlyRate}/hr`}
                                </div>
                              </div>
                            </div>
                            <span className="app-status-badge" style={{ color: sc.color, background: sc.bg }}>
                              {sc.label}
                            </span>
                          </div>

                          {app.fresher.profile?.bio && (
                            <div className="app-fresher-bio">{app.fresher.profile.bio}</div>
                          )}

                          {app.coverLetter && (
                            <div className="app-cover-letter">
                              <div className="app-cover-label">Cover letter</div>
                              <div className="app-cover-text">{app.coverLetter}</div>
                            </div>
                          )}

                          {app.status === 'PENDING' && (
                            <div className="app-actions">
                              <button className="app-btn-accept" disabled={updating === app.id}
                                onClick={() => updateStatus(app.id, 'ACCEPTED')}>
                                ✓ Accept
                              </button>
                              <button className="app-btn-reject" disabled={updating === app.id}
                                onClick={() => updateStatus(app.id, 'REJECTED')}>
                                ✕ Reject
                              </button>
                            </div>
                          )}

                          {app.status === 'ACCEPTED' && (
                            <div className="app-actions">
                              <button className="app-btn-complete" disabled={updating === app.id}
                                onClick={() => updateStatus(app.id, 'COMPLETED')}>
                                🎉 Mark as completed
                              </button>
                            </div>
                          )}

                          {app.status === 'COMPLETED' && !app.review && (
                            <div className="app-completed-note">
                              ✅ Completed — awaiting mentor review
                            </div>
                          )}

                          {app.status === 'COMPLETED' && app.review && (
                            <div className="app-completed-note" style={{ color: '#7C3AED' }}>
                              ⭐ Mentor review submitted
                            </div>
                          )}

                          <div className="app-date">
                            Applied {new Date(app.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}