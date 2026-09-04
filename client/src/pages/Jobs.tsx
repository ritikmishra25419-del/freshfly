import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import PageLayout from '../components/PageLayout';
import '../styles/jobs.css';

interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  tierRequired: number;
  skills: string;
  isRemote: boolean;
  status: string;
  category: string;
  createdAt: string;
  client: { id: number; name: string };
}

interface PostJobForm {
  title: string;
  description: string;
  budget: string;
  tierRequired: string;
  skills: string;
  isRemote: boolean;
  category: string;
}

const categories = [
  { value: 'ALL', label: '🌐 All' },
  { value: 'WEB_DEV', label: '💻 Web Dev' },
  { value: 'APP_DEV', label: '📱 App Dev' },
  { value: 'UI_UX', label: '🎨 UI/UX' },
  { value: 'GRAPHIC_DESIGN', label: '✏️ Design' },
  { value: 'DATA_SCIENCE', label: '📊 Data' },
  { value: 'VIDEO_EDITING', label: '🎬 Video' },
  { value: 'WRITING', label: '✍️ Writing' },
  { value: 'MARKETING', label: '📣 Marketing' },
  { value: 'TRANSLATION', label: '🌍 Translation' },
  { value: 'OTHER', label: '📦 Other' },
];

const categoryLabels: Record<string, string> = {
  WEB_DEV: '💻 Web Dev',
  APP_DEV: '📱 App Dev',
  UI_UX: '🎨 UI/UX',
  GRAPHIC_DESIGN: '✏️ Design',
  DATA_SCIENCE: '📊 Data',
  VIDEO_EDITING: '🎬 Video',
  WRITING: '✍️ Writing',
  MARKETING: '📣 Marketing',
  TRANSLATION: '🌍 Translation',
  OTHER: '📦 Other',
};

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeTier, setActiveTier] = useState('ALL');

  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState<PostJobForm>({
    title: '', description: '', budget: '',
    tierRequired: '1', skills: '', isRemote: true, category: 'WEB_DEV',
  });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeCategory !== 'ALL') params.append('category', activeCategory);
      if (activeTier !== 'ALL') params.append('tier', activeTier);

      const res = await api.get(`/jobs?${params.toString()}`);
      const data = res.data as { jobs: Job[] | Record<string, Job> };
      if (Array.isArray(data.jobs)) setJobs(data.jobs);
      else setJobs(Object.values(data.jobs));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, activeTier]);

  useEffect(() => {
    const timer = setTimeout(() => { loadJobs(); }, 300);
    return () => clearTimeout(timer);
  }, [loadJobs]);

  useEffect(() => {
    if (user?.role === 'FRESHER') {
      api.get('/applications/my')
        .then(res => {
          const data = res.data as { applications: { job: { id: number } }[] };
          setAppliedJobIds(data.applications.map(a => a.job.id));
        })
        .catch(console.error);
    }
  }, [user]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(''); setPosting(true);
    try {
      const res = await api.post('/jobs', {
        ...postForm,
        budget: parseFloat(postForm.budget),
        tierRequired: parseInt(postForm.tierRequired),
      });
      const newJob = (res.data as { job: Job }).job;
      setJobs(prev => [newJob, ...prev]);
      setShowPostForm(false);
      setPostSuccess(true);
      setPostForm({ title: '', description: '', budget: '', tierRequired: '1', skills: '', isRemote: true, category: 'WEB_DEV' });
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err: any) {
      setPostError(err.response?.data?.message || 'Failed to post job.');
    } finally { setPosting(false); }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    setApplyError(''); setApplying(true);
    try {
      await api.post(`/applications/job/${applyingJob.id}`, { coverLetter });
      setAppliedJobIds(prev => [...prev, applyingJob.id]);
      setApplyingJob(null);
      setCoverLetter('');
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to apply.');
    } finally { setApplying(false); }
  };

  const tierColor: Record<number, string> = {
    1: '#22C55E', 2: '#7C3AED', 3: '#F59E0B',
  };

  return (
    <PageLayout>
      <div className="jobs-main">
        <div className="jobs-header">
          <div>
            <h1 className="jobs-title">{user?.role === 'CLIENT' ? 'Manage Jobs' : 'Find Jobs'}</h1>
            <p className="jobs-subtitle">
              {user?.role === 'FRESHER'
                ? 'Showing jobs matching your tier — only compete at your level'
                : user?.role === 'CLIENT'
                ? 'Post jobs and manage your listings'
                : 'Browse all open jobs on the platform'}
            </p>
          </div>
          {user?.role === 'CLIENT' && (
            <button className="jobs-post-btn" onClick={() => setShowPostForm(true)}>+ Post a job</button>
          )}
        </div>

        <div className="jobs-search-bar">
          <input
            type="text"
            placeholder="🔍 Search jobs by title, skill, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="jobs-search-input"
          />
        </div>

        <div className="jobs-category-tabs">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`jobs-cat-tab ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {user?.role === 'FRESHER' && (
          <div className="jobs-tier-filter">
            <span className="jobs-tier-label">Tier:</span>
            {['ALL', '1', '2', '3'].map(t => (
              <button
                key={t}
                className={`jobs-tier-btn ${activeTier === t ? 'active' : ''}`}
                onClick={() => setActiveTier(t)}
              >
                {t === 'ALL' ? 'All tiers' : `Tier ${t}`}
              </button>
            ))}
          </div>
        )}

        {postSuccess && <div className="jobs-success-banner">✅ Job posted successfully!</div>}
        {applySuccess && <div className="jobs-success-banner">🎉 Application submitted! Good luck!</div>}

        {showPostForm && (
          <div className="jobs-modal-overlay" onClick={() => setShowPostForm(false)}>
            <div className="jobs-modal" onClick={e => e.stopPropagation()}>
              <button className="jobs-modal-close" onClick={() => setShowPostForm(false)}>✕</button>
              <h2 className="jobs-modal-title">Post a new job</h2>
              <p className="jobs-modal-sub">Fill in the details — freshers will see this based on their tier.</p>
              <form onSubmit={handlePostJob} className="jobs-post-form">
                <div className="jobs-form-group">
                  <label>Job title</label>
                  <input type="text" placeholder="e.g. React Landing Page"
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })} required />
                </div>
                <div className="jobs-form-group">
                  <label>Description</label>
                  <textarea rows={3} placeholder="Describe the project in detail..."
                    value={postForm.description}
                    onChange={e => setPostForm({ ...postForm, description: e.target.value })} required />
                </div>
                <div className="jobs-form-row">
                  <div className="jobs-form-group">
                    <label>Category</label>
                    <select value={postForm.category}
                      onChange={e => setPostForm({ ...postForm, category: e.target.value })}>
                      {categories.filter(c => c.value !== 'ALL').map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jobs-form-group">
                    <label>Tier required</label>
                    <select value={postForm.tierRequired}
                      onChange={e => setPostForm({ ...postForm, tierRequired: e.target.value })}>
                      <option value="1">Tier 1 — Starter</option>
                      <option value="2">Tier 2 — Rising</option>
                      <option value="3">Tier 3 — Pro</option>
                    </select>
                  </div>
                </div>
                <div className="jobs-form-group">
                  <label>Budget (₹)</label>
                  <input type="number" placeholder="e.g. 5000"
                    value={postForm.budget}
                    onChange={e => setPostForm({ ...postForm, budget: e.target.value })} required />
                </div>
                <div className="jobs-form-group">
                  <label>Skills (comma separated)</label>
                  <input type="text" placeholder="e.g. React, Tailwind, Node.js"
                    value={postForm.skills}
                    onChange={e => setPostForm({ ...postForm, skills: e.target.value })} required />
                </div>
                <div className="jobs-form-check">
                  <input type="checkbox" id="remote" checked={postForm.isRemote}
                    onChange={e => setPostForm({ ...postForm, isRemote: e.target.checked })} />
                  <label htmlFor="remote">Remote job</label>
                </div>
                {postError && <div className="jobs-form-error">{postError}</div>}
                <button type="submit" className="jobs-form-submit" disabled={posting}>
                  {posting ? 'Posting...' : 'Post job →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {applyingJob && (
          <div className="jobs-modal-overlay" onClick={() => setApplyingJob(null)}>
            <div className="jobs-modal" onClick={e => e.stopPropagation()}>
              <button className="jobs-modal-close" onClick={() => setApplyingJob(null)}>✕</button>
              <h2 className="jobs-modal-title">Apply to this job</h2>
              <p className="jobs-modal-sub">{applyingJob.title} · ₹{applyingJob.budget.toLocaleString()}</p>
              <form onSubmit={handleApply} className="jobs-post-form">
                <div className="jobs-form-group">
                  <label>Cover letter</label>
                  <textarea rows={5}
                    placeholder="Tell the client why you're a great fit..."
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)} required />
                </div>
                {applyError && <div className="jobs-form-error">{applyError}</div>}
                <button type="submit" className="jobs-form-submit" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit application →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="jobs-loading">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="jobs-empty">
            <div className="jobs-empty-icon">🔍</div>
            <div className="jobs-empty-title">
              {search || activeCategory !== 'ALL' ? 'No jobs match your search' : 'No jobs yet'}
            </div>
            <div className="jobs-empty-sub">
              {search || activeCategory !== 'ALL'
                ? 'Try different keywords or remove filters.'
                : user?.role === 'CLIENT'
                ? 'Post your first job to start hiring talented freshers.'
                : 'Check back soon — new jobs are posted daily.'}
            </div>
            {(search || activeCategory !== 'ALL') && (
              <button className="jobs-post-btn" style={{ marginTop: 16 }}
                onClick={() => { setSearch(''); setActiveCategory('ALL'); setActiveTier('ALL'); }}>
                Clear filters
              </button>
            )}
            {!search && activeCategory === 'ALL' && user?.role === 'CLIENT' && (
              <button className="jobs-post-btn" style={{ marginTop: 16 }}
                onClick={() => setShowPostForm(true)}>
                + Post your first job
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="jobs-results-count">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
              {search && ` for "${search}"`}
              {activeCategory !== 'ALL' && ` in ${categoryLabels[activeCategory]}`}
            </div>
            <div className="jobs-grid">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-card-top">
                    <div className="job-client-info">
                      <div className="job-client-avatar">
                        {job.client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="job-client-name">{job.client.name}</div>
                        <div className="job-client-verified">Verified client ✓</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="job-category-badge">
                        {categoryLabels[job.category] || job.category}
                      </span>
                      <div className="job-tier-badge" style={{
                        background: `${tierColor[job.tierRequired]}20`,
                        color: tierColor[job.tierRequired],
                      }}>
                        T{job.tierRequired}
                      </div>
                    </div>
                  </div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-desc">
                    {job.description.slice(0, 100)}{job.description.length > 100 ? '...' : ''}
                  </div>
                  <div className="job-skills">
                    {job.skills.split(',').map(s => (
                      <span key={s} className="job-skill-tag">{s.trim()}</span>
                    ))}
                    {job.isRemote && <span className="job-skill-tag job-remote-tag">Remote</span>}
                  </div>
                  <div className="job-card-bottom">
                    <div className="job-budget">₹{job.budget.toLocaleString()}</div>
                    {user?.role === 'FRESHER' && (
                      appliedJobIds.includes(job.id) ? (
                        <span className="job-applied-badge">✓ Applied</span>
                      ) : (
                        <button className="job-apply-btn"
                          onClick={() => { setApplyingJob(job); setApplyError(''); }}>
                          Apply now
                        </button>
                      )
                    )}
                    {user?.role === 'CLIENT' && <span className="job-posted-badge">📋 Your listing</span>}
                    {user?.role === 'MENTOR' && <span className="job-posted-badge">👀 Viewing</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}