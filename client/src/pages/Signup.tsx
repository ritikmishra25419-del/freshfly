import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useTheme, roleDefaultTheme } from '../store/ThemeContext';
import type { AuthResponse, SignupPayload } from '../types/auth';
import '../styles/auth.css';

const roles = [
  { value: 'FRESHER', label: 'Fresher', desc: 'Looking for my first gigs', icon: '🚀' },
  { value: 'CLIENT', label: 'Client', desc: 'Hiring talented freshers', icon: '💼' },
  { value: 'MENTOR', label: 'Mentor', desc: 'Reviewing and vouching for freshers', icon: '🎓' },
] as const;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setTheme } = useTheme();
  const [form, setForm] = useState<SignupPayload>({ name: '', email: '', password: '', role: 'FRESHER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/signup', form);
      login(res.data.token, res.data.user);
      setTheme(roleDefaultTheme[form.role]);
      navigate('/choose-theme');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">FreshFly ✦</div>
        <div className="auth-left-content">
          <div className="auth-left-title">
            Land Your First<br />Freelance Gig.<br /><span>Not Your Hundredth.</span>
          </div>
          <div className="auth-left-sub">
            The world's first freelancing platform built exclusively for beginners. No competing against pros — ever.
          </div>
        </div>
        <div className="auth-left-stats">
          <div className="auth-stat">
            <div className="auth-stat-num">12,400+</div>
            <div className="auth-stat-label">Freshers placed</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-num">98%</div>
            <div className="auth-stat-label">Success rate</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-heading">Create your account</div>
          <div className="auth-subheading">Start your freelance journey today — it's free.</div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full name</label>
              <input type="text" placeholder="Ritik Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>I am a...</label>
              <div className="role-picker">
                {roles.map(role => (
                  <div key={role.value}
                    className={`role-card ${form.role === role.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, role: role.value })}>
                    <div className="role-icon">{role.icon}</div>
                    <div className="role-text">
                      <span className="role-label">{role.label}</span>
                      <span className="role-desc">{role.desc}</span>
                    </div>
                    <div className="role-check">✓</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}