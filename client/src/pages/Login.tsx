import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import type { AuthResponse } from '../types/auth';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
            Welcome<br />back to<br /><span>FreshFly.</span>
          </div>
          <div className="auth-left-sub">
            Your freelance journey continues. Log in to see new job opportunities matched to your tier.
          </div>
        </div>
        <div className="auth-left-stats">
          <div className="auth-stat">
            <div className="auth-stat-num">340+</div>
            <div className="auth-stat-label">New jobs today</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-num">4.9 ⭐</div>
            <div className="auth-stat-label">Avg mentor rating</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-heading">Log in to FreshFly</div>
          <div className="auth-subheading">Good to see you again.</div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Your password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in →'}
            </button>
          </form>

          <p className="auth-switch">
            No account yet? <Link to="/signup">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}