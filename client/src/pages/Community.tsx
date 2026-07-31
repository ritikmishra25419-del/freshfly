import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/community.css';

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'QUESTION' | 'SHOWCASE' | 'FEEDBACK' | 'DISCUSSION';
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: { name: string };
    profile: { tier: number | null } | null;
  };
  comments: Comment[];
  reactions: Reaction[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
}

interface Reaction {
  id: number;
  type: 'LIKE' | 'FIRE' | 'CLAP';
  userId: number;
}

const navItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '🗂️', label: 'Portfolio', path: '/portfolio' },
  { icon: '🪪', label: 'Career Passport', path: '/passport' },
  { icon: '🗺️', label: 'Roadmap', path: '/roadmap' },
  { icon: '👥', label: 'Community', path: '/community' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

const themeColors: Record<string, string> = {
  ocean: '#2563EB', cosmic: '#7C3AED', mint: '#10B981',
  midnight: '#3B82F6', neon: '#FF0080',
};

const typeConfig = {
  QUESTION: { label: 'Question', color: '#F59E0B', bg: '#FFFBEB', icon: '❓' },
  SHOWCASE: { label: 'Showcase', color: '#7C3AED', bg: '#EEF0FF', icon: '🚀' },
  FEEDBACK: { label: 'Feedback', color: '#10B981', bg: '#ECFDF5', icon: '💡' },
  DISCUSSION: { label: 'Discussion', color: '#0EA5E9', bg: '#EFF6FF', icon: '💬' },
};

const reactionEmoji = { LIKE: '👍', FIRE: '🔥', CLAP: '👏' };

export default function Community() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activePost, setActivePost] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'DISCUSSION' });
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await api.get('/community');
      const data = res.data as { posts: Post[] };
      setPosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await api.post('/community', form);
      const data = res.data as { post: Post };
      setPosts(prev => [data.post, ...prev]);
      setShowForm(false);
      setForm({ title: '', content: '', type: 'DISCUSSION' });
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (postId: number, type: string) => {
    try {
      await api.post(`/community/${postId}/react`, { type });
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId: number) => {
    const content = commentText[postId]?.trim();
    if (!content) return;
    setSubmittingComment(postId);
    try {
      const res = await api.post(`/community/${postId}/comments`, { content });
      const data = res.data as { comment: Comment };
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, data.comment] } : p
      ));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await api.delete(`/community/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  const getReactionCount = (reactions: Reaction[], type: string) =>
    reactions.filter(r => r.type === type).length;

  const hasReacted = (reactions: Reaction[], type: string) =>
    reactions.some(r => r.type === type && r.userId === user?.id);

  const filteredPosts = filter === 'ALL' ? posts : posts.filter(p => p.type === filter);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="comm-page">
      <div className="comm-sidebar">
        <div className="comm-sidebar-logo">FreshFly ✦</div>
        <div className="comm-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`comm-sidebar-item ${item.path === '/community' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="comm-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="comm-theme-label">Theme</div>
          <div className="comm-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="comm-theme-dot"
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
          <button className="comm-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="comm-main">
        <div className="comm-header">
          <div>
            <h1 className="comm-title">Community</h1>
            <p className="comm-subtitle">Ask questions, share wins, help each other grow</p>
          </div>
          <button className="comm-post-btn" onClick={() => setShowForm(true)}>
            + New post
          </button>
        </div>

        <div className="comm-filters">
          {['ALL', 'QUESTION', 'SHOWCASE', 'FEEDBACK', 'DISCUSSION'].map(f => (
            <button
              key={f}
              className={`comm-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? '🌐 All' : `${typeConfig[f as keyof typeof typeConfig].icon} ${typeConfig[f as keyof typeof typeConfig].label}`}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="comm-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="comm-modal" onClick={e => e.stopPropagation()}>
              <button className="comm-modal-close" onClick={() => setShowForm(false)}>✕</button>
              <h2 className="comm-modal-title">Create a post</h2>
              <p className="comm-modal-sub">Share with the FreshFly community</p>
              <form onSubmit={handleCreatePost} className="comm-form">
                <div className="comm-type-grid">
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <div
                      key={type}
                      className={`comm-type-card ${form.type === type ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, type })}
                    >
                      <span className="comm-type-icon">{config.icon}</span>
                      <span className="comm-type-label">{config.label}</span>
                    </div>
                  ))}
                </div>
                <div className="comm-form-group">
                  <label>Title</label>
                  <input type="text" placeholder="What's on your mind?"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required />
                </div>
                <div className="comm-form-group">
                  <label>Content</label>
                  <textarea rows={4}
                    placeholder="Share more details, context, or your question..."
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    required />
                </div>
                <button type="submit" className="comm-submit-btn" disabled={posting}>
                  {posting ? 'Posting...' : 'Post to community →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="comm-loading">Loading community posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="comm-empty">
            <div className="comm-empty-icon">👥</div>
            <div className="comm-empty-title">
              {filter === 'ALL' ? 'No posts yet' : `No ${filter.toLowerCase()} posts yet`}
            </div>
            <div className="comm-empty-sub">
              Be the first to post — ask a question, share a win, or start a discussion.
            </div>
            <button className="comm-post-btn" style={{ marginTop: 16 }}
              onClick={() => setShowForm(true)}>
              + Create the first post
            </button>
          </div>
        ) : (
          <div className="comm-feed">
            {filteredPosts.map(post => {
              const tc = typeConfig[post.type];
              const isExpanded = activePost === post.id;
              const isOwn = post.user.id === user?.id;

              return (
                <div key={post.id} className="comm-post">
                  <div className="comm-post-header">
                    <div className="comm-post-author">
                      <div className="comm-post-avatar">
                        {post.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="comm-post-author-name">{post.user.name}</div>
                        <div className="comm-post-author-meta">
                          {post.user.role.name}
                          {post.user.profile?.tier && ` · Tier ${post.user.profile.tier}`}
                          {' · '}{timeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="comm-post-header-right">
                      <span className="comm-type-badge"
                        style={{ background: tc.bg, color: tc.color }}>
                        {tc.icon} {tc.label}
                      </span>
                      {isOwn && (
                        <button className="comm-delete-btn"
                          onClick={() => handleDelete(post.id)}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="comm-post-title">{post.title}</div>
                  <div className="comm-post-content">{post.content}</div>

                  <div className="comm-post-actions">
                    <div className="comm-reactions">
                      {(['LIKE', 'FIRE', 'CLAP'] as const).map(type => (
                        <button
                          key={type}
                          className={`comm-reaction-btn ${hasReacted(post.reactions, type) ? 'active' : ''}`}
                          onClick={() => handleReact(post.id, type)}
                        >
                          {reactionEmoji[type]}
                          {getReactionCount(post.reactions, type) > 0 && (
                            <span>{getReactionCount(post.reactions, type)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      className="comm-comment-toggle"
                      onClick={() => setActivePost(isExpanded ? null : post.id)}
                    >
                      💬 {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="comm-comments">
                      {post.comments.length === 0 ? (
                        <div className="comm-no-comments">No comments yet — be the first!</div>
                      ) : (
                        post.comments.map(comment => (
                          <div key={comment.id} className="comm-comment">
                            <div className="comm-comment-avatar">
                              {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="comm-comment-body">
                              <div className="comm-comment-author">{comment.user.name}</div>
                              <div className="comm-comment-text">{comment.content}</div>
                              <div className="comm-comment-time">{timeAgo(comment.createdAt)}</div>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="comm-add-comment">
                        <div className="comm-comment-input-avatar">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <input
                          className="comm-comment-input"
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText[post.id] || ''}
                          onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id); }}
                          disabled={submittingComment === post.id}
                        />
                        <button
                          className="comm-comment-send"
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText[post.id]?.trim() || submittingComment === post.id}
                        >
                          {submittingComment === post.id ? '...' : '→'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}