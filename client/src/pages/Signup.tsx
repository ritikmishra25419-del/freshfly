import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import type { AuthResponse, SignupPayload } from '../types/auth';
import '../styles/auth.css';

const roles = [
  { value: 'FRESHER', label: 'Fresher', desc: 'Looking for my first gigs' },
  { value: 'CLIENT', label: 'Client', desc: 'Hiring talented freshers' },
  { value: 'MENTOR', label: 'Mentor', desc: 'Reviewing and vouching for freshers' },
] as const;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<SignupPayload>({
    name: '',
    email: '',
    password: '',
    role: 'FRESHER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('submitting form', form);
    setError('');
    setLoading(true);
    try {
      console.log('calling api...');
      const res = await api.post<AuthResponse>('/auth/signup', form);
      console.log('api response', res.data);
      login(res.data.token, res.data.user);
      navigate('/profile');
    } catch (err: any) {
      console.log('caught error', err);
      console.log('error response', err?.response);
      console.log('error message', err?.message);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">FreshFly</h1>
          <p className="auth-subtitle">Start your freelance journey</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>I am a...</label>
            <div className="role-picker">
              {roles.map(role => (
                <div
                  key={role.value}
                  className={`role-card ${form.role === role.value ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, role: role.value })}
                >
                  <span className="role-label">{role.label}</span>
                  <span className="role-desc">{role.desc}</span>
                </div>
              ))}
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}