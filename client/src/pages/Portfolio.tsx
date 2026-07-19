import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/portfolio.css';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  techStack: string;
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: string;
}

interface PortfolioForm {
  title: string;
  description: string;
  techStack: string;
  githubUrl: string;
  liveUrl: string;
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

const emptyForm: PortfolioForm = {
  title: '', description: '', techStack: '', githubUrl: '', liveUrl: '',
};

export default function Portfolio() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PortfolioForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const isFresher = user?.role === 'FRESHER';
  useEffect(() => {
  if (!isFresher) {
    setLoading(false);
    return;
  }
  api.get('/portfolio/my')
    .then(res => {
      const data = res.data as { items: PortfolioItem[] };
      setItems(data.items);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, [isFresher]);
  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (item: PortfolioItem) => {
    setForm({
      title: item.title,
      description: item.description,
      techStack: item.techStack,
      githubUrl: item.githubUrl || '',
      liveUrl: item.liveUrl || '',
    });
    setEditingId(item.id);
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/portfolio/${editingId}`, form);
        const data = res.data as { item: PortfolioItem };
        setItems(prev => prev.map(i => i.id === editingId ? data.item : i));
        setSuccessMsg('Project updated successfully!');
      } else {
        const res = await api.post('/portfolio', form);
        const data = res.data as { item: PortfolioItem };
        setItems(prev => [data.item, ...prev]);
        setSuccessMsg('Project added to your portfolio!');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/portfolio/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteConfirm(null);
      setSuccessMsg('Project removed from portfolio.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  

  return (
    <div className="port-page">
      <div className="port-sidebar">
        <div className="port-sidebar-logo">FreshFly ✦</div>
        <div className="port-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`port-sidebar-item ${item.path === '/portfolio' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="port-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="port-theme-label">Theme</div>
          <div className="port-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="port-theme-dot"
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
          <button className="port-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="port-main">
        <div className="port-header">
          <div>
            <h1 className="port-title">Portfolio</h1>
            <p className="port-subtitle">
              {isFresher
                ? 'Showcase your projects — clients browse this when deciding who to hire'
                : 'Viewing portfolio projects'}
            </p>
          </div>
          {isFresher && (
            <button className="port-add-btn" onClick={openAddForm}>
              + Add project
            </button>
          )}
        </div>

        {successMsg && (
          <div className="port-success-banner">✅ {successMsg}</div>
        )}

        {showForm && (
          <div className="port-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="port-modal" onClick={e => e.stopPropagation()}>
              <button className="port-modal-close" onClick={() => setShowForm(false)}>✕</button>
              <h2 className="port-modal-title">
                {editingId ? 'Edit project' : 'Add a project'}
              </h2>
              <p className="port-modal-sub">
                {editingId
                  ? 'Update your project details.'
                  : 'Add a project to show clients what you can build.'}
              </p>
              <form onSubmit={handleSave} className="port-form">
                <div className="port-form-group">
                  <label>Project title</label>
                  <input type="text" placeholder="e.g. E-commerce Landing Page"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required />
                </div>
                <div className="port-form-group">
                  <label>Description</label>
                  <textarea rows={3}
                    placeholder="What did you build? What problem does it solve? What was your role?"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required />
                </div>
                <div className="port-form-group">
                  <label>Tech stack (comma separated)</label>
                  <input type="text" placeholder="e.g. React, Node.js, MySQL, Tailwind"
                    value={form.techStack}
                    onChange={e => setForm({ ...form, techStack: e.target.value })}
                    required />
                </div>
                <div className="port-form-row">
                  <div className="port-form-group">
                    <label>GitHub URL (optional)</label>
                    <input type="url" placeholder="https://github.com/..."
                      value={form.githubUrl}
                      onChange={e => setForm({ ...form, githubUrl: e.target.value })} />
                  </div>
                  <div className="port-form-group">
                    <label>Live demo URL (optional)</label>
                    <input type="url" placeholder="https://myproject.com"
                      value={form.liveUrl}
                      onChange={e => setForm({ ...form, liveUrl: e.target.value })} />
                  </div>
                </div>
                {formError && <div className="port-form-error">{formError}</div>}
                <button type="submit" className="port-form-submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update project →' : 'Add to portfolio →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="port-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="port-confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="port-confirm-icon">🗑️</div>
              <h3 className="port-confirm-title">Remove this project?</h3>
              <p className="port-confirm-sub">
                This will permanently remove the project from your portfolio.
              </p>
              <div className="port-confirm-actions">
                <button className="port-confirm-delete"
                  onClick={() => handleDelete(deleteConfirm)}>
                  Yes, remove it
                </button>
                <button className="port-confirm-cancel"
                  onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="port-loading">Loading portfolio...</div>
        ) : items.length === 0 ? (
  <div className="port-empty">
    <div className="port-empty-icon">🗂️</div>
    <div className="port-empty-title">
      {isFresher ? 'Your portfolio is empty' : 'Portfolio is for freshers'}
    </div>
    <div className="port-empty-sub">
      {isFresher
        ? 'Add your first project — even a practice project counts! Clients look at portfolios before hiring.'
        : user?.role === 'CLIENT'
        ? 'Freelancers build portfolios here to showcase their work. Browse the job board to find freshers and view their portfolios.'
        : 'Freshers use this page to showcase their projects. You can view a fresher\'s portfolio from their profile.'}
    </div>
    {isFresher && (
      <button className="port-add-btn" style={{ marginTop: 20 }} onClick={openAddForm}>
        + Add your first project
      </button>
    )}
    {!isFresher && (
      <button className="port-add-btn" style={{ marginTop: 20 }}
        onClick={() => navigate('/jobs')}>
        {user?.role === 'CLIENT' ? 'Browse jobs →' : 'Go to jobs →'}
      </button>
    )}
  </div>
        ) : (
          <div className="port-grid">
            {items.map(item => (
              <div key={item.id} className="port-card">
                <div className="port-card-header">
                  <div className="port-card-icon">
                    {item.title.charAt(0).toUpperCase()}
                  </div>
                  {isFresher && (
                    <div className="port-card-actions">
                      <button className="port-edit-btn" onClick={() => openEditForm(item)}>
                        ✏️ Edit
                      </button>
                      <button className="port-delete-btn"
                        onClick={() => setDeleteConfirm(item.id)}>
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                <div className="port-card-title">{item.title}</div>
                <div className="port-card-desc">{item.description}</div>

                <div className="port-card-tech">
                  {item.techStack.split(',').map(t => (
                    <span key={t} className="port-tech-tag">{t.trim()}</span>
                  ))}
                </div>

                <div className="port-card-links">
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noreferrer"
                      className="port-link port-link-github">
                      GitHub →
                    </a>
                  )}
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noreferrer"
                      className="port-link port-link-live">
                      Live demo →
                    </a>
                  )}
                  {!item.githubUrl && !item.liveUrl && (
                    <span className="port-no-links">No links added</span>
                  )}
                </div>

                <div className="port-card-date">
                  Added {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
