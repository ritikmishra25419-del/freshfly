import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme, roleDefaultTheme } from '../store/ThemeContext';
import api from '../services/api';
import type { AuthResponse, SignupPayload } from '../types/auth';
import '../styles/landing.css';

type ModalMode = 'signup' | 'login';

const roles = [
  { value: 'FRESHER', label: 'Fresher', desc: 'Looking for my first gigs', icon: '🚀' },
  { value: 'CLIENT', label: 'Client', desc: 'Hiring talented freshers', icon: '💼' },
  { value: 'MENTOR', label: 'Mentor', desc: 'Reviewing and vouching', icon: '🎓' },
] as const;

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setTheme } = useTheme();

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [signupForm, setSignupForm] = useState<SignupPayload>({ name: '', email: '', password: '', role: 'FRESHER' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = (mode: ModalMode) => { setModal(mode); setError(''); };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/signup', signupForm);
      login(res.data.token, res.data.user);
      setTheme(roleDefaultTheme[signupForm.role]);
      navigate('/choose-theme');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', loginForm);
      login(res.data.token, res.data.user);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="land-page">

      <nav className="land-nav">
        <div className="land-logo">Fresh<span>Fly</span> ✦</div>
        <div className="land-nav-links">
          <a>Features</a>
          <a>Jobs</a>
          <a>Mentors</a>
          <a>Pricing</a>
          <a>Community</a>
        </div>
        <button className="land-nav-login" onClick={() => openModal('login')}>Log in</button>
      </nav>

      <div className="land-hero">
        <div className="land-hero-bg" />
        <div className="land-eyebrow">
          <span className="land-eyebrow-dot" />
          Now in beta — 12,400+ freshers joined
        </div>
        <h1 className="land-title">
          <span>Land Your First</span>
          <span>Freelance Gig.</span>
          <span className="land-title-grad">Not Your Hundredth.</span>
        </h1>
        <p className="land-sub">
          The world's first freelancing platform built exclusively for beginners.
          You only compete against other freshers — never against pros with 500 reviews.
        </p>
        <div className="land-hero-btns">
          <button className="land-btn-primary" onClick={() => openModal('signup')}>
            Get started free →
          </button>
          <button className="land-btn-secondary" onClick={() => openModal('signup')}>
            Explore jobs
          </button>
        </div>
        <div className="land-trust">
          <div className="land-avatars">
            {['R','A','P','S','K'].map((l, i) => (
              <div key={l} className="land-avatar" style={{ background: ['#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'][i] }}>{l}</div>
            ))}
          </div>
          <span>Joined by 12,400+ freshers across India</span>
        </div>

        <div className="land-hero-cards">
          <div className="land-hcard">
            <div className="land-hcard-top">
              <span className="land-hcard-label">Your tier</span>
              <span className="land-badge land-badge-green">Tier 1</span>
            </div>
            <div className="land-hcard-val">Starter</div>
            <div className="land-hcard-sub">3 jobs to Tier 2</div>
            <div className="land-hprogress"><div className="land-hprogress-fill" style={{ width: '30%', background: 'linear-gradient(90deg,#22C55E,#4ADE80)' }} /></div>
          </div>
          <div className="land-hcard">
            <div className="land-hcard-top">
              <span className="land-hcard-label">New offer</span>
              <span className="land-badge land-badge-cyan">Live</span>
            </div>
            <div className="land-hcard-val">₹6,000</div>
            <div className="land-hcard-sub">React landing page</div>
            <div className="land-hprogress"><div className="land-hprogress-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#22D3EE,#0EA5E9)' }} /></div>
          </div>
          <div className="land-hcard">
            <div className="land-hcard-top">
              <span className="land-hcard-label">Rating</span>
              <span className="land-badge land-badge-purple">Top 10%</span>
            </div>
            <div className="land-hcard-val">4.9 ★</div>
            <div className="land-hcard-sub">From 7 clients</div>
            <div className="land-hprogress"><div className="land-hprogress-fill" style={{ width: '90%', background: 'linear-gradient(90deg,#A78BFA,#7C3AED)' }} /></div>
          </div>
        </div>
      </div>

      <div className="land-stats">
        {[
          { num: '12,400+', label: 'Freshers placed' },
          { num: '₹2.4 Cr+', label: 'Earned by freshers' },
          { num: '98%', label: 'First-gig success rate' },
          { num: '340+', label: 'New jobs daily' },
        ].map(s => (
          <div key={s.label} className="land-stat">
            <div className="land-stat-num">{s.num}</div>
            <div className="land-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="land-section">
        <div className="land-eyebrow-sm">Features</div>
        <h2 className="land-sec-title">Everything a fresher needs</h2>
        <p className="land-sec-sub">We removed every barrier that stops beginners from landing their first paid gig.</p>
        <div className="land-features">
          {[
            { icon: '🏆', title: 'Tiered marketplace', desc: 'Only compete against freshers at your level. No more invisible profiles.', bg: 'rgba(124,58,237,0.15)' },
            { icon: '🎓', title: 'Mentor reviews', desc: 'Experienced freelancers review your work and vouch for your skills.', bg: 'rgba(34,211,238,0.12)' },
            { icon: '🪪', title: 'Career passport', desc: 'A living portfolio that grows with every project and verified skill.', bg: 'rgba(251,191,36,0.12)' },
            { icon: '📈', title: 'Skill roadmap', desc: 'Know exactly what to learn next — from HTML to full-stack freelancing.', bg: 'rgba(34,197,94,0.12)' },
            { icon: '👥', title: 'Community', desc: 'Connect with 12,000+ freshers. Share projects, ask questions, grow.', bg: 'rgba(239,68,68,0.12)' },
            { icon: '⚡', title: 'Fast payments', desc: 'Get paid within 24 hours of project approval. No delays.', bg: 'rgba(14,165,233,0.12)' },
          ].map(f => (
            <div key={f.title} className="land-feat-card">
              <div className="land-feat-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div className="land-feat-title">{f.title}</div>
              <div className="land-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="land-tier-section">
        <div className="land-eyebrow-sm">Tier system</div>
        <h2 className="land-sec-title" style={{ fontSize: 22 }}>From first gig to open market</h2>
        <div className="land-tier-track">
          {[
            { label: 'T1', name: 'Starter', desc: 'First small jobs', bg: 'linear-gradient(135deg,#22C55E,#16A34A)' },
            { label: 'T2', name: 'Rising', desc: 'Bigger budgets', bg: 'linear-gradient(135deg,#7C3AED,#A855F7)' },
            { label: 'T3', name: 'Pro', desc: 'Top fresher', bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)' },
            { label: '🎓', name: 'Graduate', desc: 'Open market', bg: 'linear-gradient(135deg,#7C3AED,#22D3EE)' },
          ].map((t, i) => (
            <div key={t.name} className="land-tier-wrap">
              <div className="land-tier-node">
                <div className="land-tier-circle" style={{ background: t.bg }}>{t.label}</div>
                <div className="land-tier-name">{t.name}</div>
                <div className="land-tier-desc">{t.desc}</div>
              </div>
              {i < 3 && <div className={`land-tier-line ${i < 1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="land-section">
        <div className="land-eyebrow-sm">Testimonials</div>
        <h2 className="land-sec-title">Freshers who made it</h2>
        <div className="land-testimonials">
          {[
            { text: '"I tried Upwork for 3 months and got zero clients. On FreshFly I landed my first project in 4 days. The tier system actually works."', name: 'Ritik Sharma', role: 'React Developer · Tier 2', color: '#7C3AED', initial: 'R' },
            { text: '"Got my first ₹8,000 project within a week. My mentor\'s review made all the difference — clients actually trusted me."', name: 'Ananya Patel', role: 'UI Designer · Tier 2', color: '#10B981', initial: 'A' },
          ].map(t => (
            <div key={t.name} className="land-testi-card">
              <div className="land-stars">★★★★★</div>
              <div className="land-testi-text">{t.text}</div>
              <div className="land-testi-author">
                <div className="land-testi-avatar" style={{ background: t.color }}>{t.initial}</div>
                <div>
                  <div className="land-testi-name">{t.name}</div>
                  <div className="land-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="land-cta">
        <h2 className="land-cta-title">Ready to land your first gig?</h2>
        <p className="land-cta-sub">Join 12,400+ freshers who stopped waiting and started earning.</p>
        <div className="land-cta-btns">
          <button className="land-btn-primary" onClick={() => openModal('signup')}>Create free account →</button>
          <button className="land-btn-secondary" onClick={() => openModal('signup')}>See open jobs</button>
        </div>
      </div>

      <footer className="land-footer">
        <div className="land-footer-logo">FreshFly ✦</div>
        <div className="land-footer-links">
          <a>Privacy</a><a>Terms</a><a>Blog</a><a>Contact</a>
        </div>
        <div className="land-footer-copy">© 2026 FreshFly</div>
      </footer>

      {modal && (
        <div className="land-modal-overlay" onClick={closeModal}>
          <div className="land-modal" onClick={e => e.stopPropagation()}>
            <button className="land-modal-close" onClick={closeModal}>✕</button>

            {modal === 'signup' ? (
              <>
                <div className="land-modal-title">Create your account</div>
                <div className="land-modal-sub">Start your freelance journey — it's free.</div>
                <form onSubmit={handleSignup} className="land-modal-form">
                  <div className="land-modal-roles">
                    {roles.map(r => (
                      <div key={r.value}
                        className={`land-modal-role ${signupForm.role === r.value ? 'active' : ''}`}
                        onClick={() => setSignupForm({ ...signupForm, role: r.value })}>
                        <div className="land-modal-role-icon">{r.icon}</div>
                        <div className="land-modal-role-label">{r.label}</div>
                        <div className="land-modal-role-desc">{r.desc}</div>
                      </div>
                    ))}
                  </div>
                  <input className="land-modal-input" type="text" placeholder="Full name" value={signupForm.name} onChange={e => setSignupForm({ ...signupForm, name: e.target.value })} required />
                  <input className="land-modal-input" type="email" placeholder="Email address" value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} required />
                  <input className="land-modal-input" type="password" placeholder="Password (min 6 chars)" value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} required minLength={6} />
                  {error && <div className="land-modal-error">{error}</div>}
                  <button type="submit" className="land-modal-btn" disabled={loading}>{loading ? 'Creating account...' : 'Create account →'}</button>
                </form>
                <p className="land-modal-switch">Already have an account? <span onClick={() => openModal('login')}>Log in</span></p>
              </>
            ) : (
              <>
                <div className="land-modal-title">Welcome back</div>
                <div className="land-modal-sub">Log in to your FreshFly workspace.</div>
                <form onSubmit={handleLogin} className="land-modal-form">
                  <input className="land-modal-input" type="email" placeholder="Email address" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
                  <input className="land-modal-input" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
                  {error && <div className="land-modal-error">{error}</div>}
                  <button type="submit" className="land-modal-btn" disabled={loading}>{loading ? 'Logging in...' : 'Log in →'}</button>
                </form>
                <p className="land-modal-switch">No account? <span onClick={() => openModal('signup')}>Sign up free</span></p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}