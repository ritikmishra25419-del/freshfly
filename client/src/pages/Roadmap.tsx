import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/roadmap.css';

const themeColors: Record<string, string> = {
  ocean: '#2563EB', cosmic: '#7C3AED', mint: '#10B981',
  midnight: '#3B82F6', neon: '#FF0080',
};

const navItems = [
  { icon: '🏠', label: 'Home', path: '/profile' },
  { icon: '💼', label: 'Jobs', path: '/jobs' },
  { icon: '📋', label: 'Applications', path: '/applications' },
  { icon: '🗂️', label: 'Portfolio', path: '/portfolio' },
  { icon: '🪪', label: 'Career Passport', path: '/passport' },
  { icon: '🗺️', label: 'Roadmap', path: '/roadmap' },
  { icon: '👥', label: 'Community', path: null },
  { icon: '💬', label: 'Messages', path: null },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

interface Step {
  id: string;
  title: string;
  desc: string;
  resources: { label: string; url: string }[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface Track {
  id: string;
  title: string;
  icon: string;
  color: string;
  steps: Step[];
}

const tracks: Track[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    icon: '🎨',
    color: '#5B5FFF',
    steps: [
      {
        id: 'html', title: 'HTML', duration: '1 week', level: 'beginner',
        desc: 'Learn the building blocks of every webpage — structure, tags, forms, and semantic HTML5.',
        resources: [
          { label: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' },
          { label: 'freeCodeCamp HTML', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
        ],
      },
      {
        id: 'css', title: 'CSS', duration: '2 weeks', level: 'beginner',
        desc: 'Style your pages with layouts, flexbox, grid, animations, and responsive design.',
        resources: [
          { label: 'CSS Tricks', url: 'https://css-tricks.com' },
          { label: 'Flexbox Froggy', url: 'https://flexboxfroggy.com' },
        ],
      },
      {
        id: 'js', title: 'JavaScript', duration: '4 weeks', level: 'beginner',
        desc: 'Make pages interactive — DOM manipulation, events, fetch API, and ES6+ syntax.',
        resources: [
          { label: 'javascript.info', url: 'https://javascript.info' },
          { label: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net' },
        ],
      },
      {
        id: 'react', title: 'React', duration: '4 weeks', level: 'intermediate',
        desc: 'Build modern UIs with components, hooks, state management, and React Router.',
        resources: [
          { label: 'React Docs', url: 'https://react.dev' },
          { label: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact' },
        ],
      },
      {
        id: 'ts', title: 'TypeScript', duration: '2 weeks', level: 'intermediate',
        desc: 'Add type safety to your JavaScript — interfaces, generics, and strict mode.',
        resources: [
          { label: 'TypeScript Docs', url: 'https://www.typescriptlang.org/docs/' },
          { label: 'Total TypeScript', url: 'https://www.totaltypescript.com' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    icon: '⚙️',
    color: '#10B981',
    steps: [
      {
        id: 'node', title: 'Node.js', duration: '2 weeks', level: 'intermediate',
        desc: 'Run JavaScript on the server — modules, file system, streams, and npm ecosystem.',
        resources: [
          { label: 'Node.js Docs', url: 'https://nodejs.org/en/docs' },
          { label: 'Node.js Tutorial', url: 'https://www.w3schools.com/nodejs/' },
        ],
      },
      {
        id: 'express', title: 'Express.js', duration: '2 weeks', level: 'intermediate',
        desc: 'Build REST APIs — routes, middleware, error handling, and request/response lifecycle.',
        resources: [
          { label: 'Express Docs', url: 'https://expressjs.com' },
          { label: 'REST API Tutorial', url: 'https://restfulapi.net' },
        ],
      },
      {
        id: 'database', title: 'Databases', duration: '3 weeks', level: 'intermediate',
        desc: 'Work with MySQL and basics of MongoDB — schemas, queries, joins, and indexing.',
        resources: [
          { label: 'MySQL Tutorial', url: 'https://www.mysqltutorial.org' },
          { label: 'MongoDB University', url: 'https://university.mongodb.com' },
        ],
      },
      {
        id: 'auth', title: 'Auth & Security', duration: '1 week', level: 'intermediate',
        desc: 'JWT tokens, bcrypt hashing, OAuth basics, and securing your API endpoints.',
        resources: [
          { label: 'JWT.io', url: 'https://jwt.io/introduction' },
          { label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
        ],
      },
    ],
  },
  {
    id: 'freelancing',
    title: 'Freelancing Skills',
    icon: '💼',
    color: '#F59E0B',
    steps: [
      {
        id: 'portfolio-build', title: 'Build a Portfolio', duration: '1 week', level: 'beginner',
        desc: 'Create 2-3 projects that showcase your skills. Quality over quantity — make them polished.',
        resources: [
          { label: 'Portfolio tips', url: 'https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio-website/' },
        ],
      },
      {
        id: 'proposals', title: 'Writing Proposals', duration: '3 days', level: 'beginner',
        desc: 'Write cover letters that get responses — personalisation, value proposition, and asking good questions.',
        resources: [
          { label: 'Proposal guide', url: 'https://www.toptal.com/freelance/how-to-write-a-freelance-proposal' },
        ],
      },
      {
        id: 'pricing', title: 'Pricing Your Work', duration: '3 days', level: 'beginner',
        desc: 'How to set rates as a fresher, scope projects correctly, and avoid undercharging.',
        resources: [
          { label: 'Freelance pricing guide', url: 'https://www.and.co/the-freelance-rates-explorer' },
        ],
      },
      {
        id: 'client', title: 'Client Communication', duration: '1 week', level: 'beginner',
        desc: 'Managing expectations, delivering updates, handling revisions, and getting testimonials.',
        resources: [
          { label: 'Client communication tips', url: 'https://toggl.com/blog/client-communication' },
        ],
      },
      {
        id: 'first-gig', title: 'Land Your First Gig', duration: 'Ongoing', level: 'beginner',
        desc: 'Apply consistently on FreshFly, customise every proposal, follow up, and keep improving.',
        resources: [
          { label: 'Browse FreshFly jobs', url: '/jobs' },
        ],
      },
    ],
  },
];

const levelColors = {
  beginner: { bg: '#DCFCE7', color: '#166534' },
  intermediate: { bg: '#EEF0FF', color: '#5B5FFF' },
  advanced: { bg: '#FEF3C7', color: '#92400E' },
};

export default function Roadmap() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('roadmap_completed') || '[]');
    } catch { return []; }
  });

  const [activeTrack, setActiveTrack] = useState('frontend');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('roadmap_completed', JSON.stringify(completed));
  }, [completed]);

  const toggleComplete = (id: string) => {
    setCompleted(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const totalSteps = tracks.reduce((sum, t) => sum + t.steps.length, 0);
  const completedCount = completed.length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  const currentTrack = tracks.find(t => t.id === activeTrack)!;
  const trackCompleted = currentTrack.steps.filter(s => completed.includes(s.id)).length;

  return (
    <div className="rm-page">
      <div className="rm-sidebar">
        <div className="rm-sidebar-logo">FreshFly ✦</div>
        <div className="rm-sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`rm-sidebar-item ${item.path === '/roadmap' ? 'active' : ''}`}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{ opacity: item.path ? 1 : 0.5, cursor: item.path ? 'pointer' : 'not-allowed' }}
              title={!item.path ? 'Coming soon' : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!item.path && <span className="rm-soon-badge">Soon</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="rm-theme-label">Theme</div>
          <div className="rm-theme-dots">
            {Object.entries(themeColors).map(([t, color]) => (
              <div key={t} title={t} onClick={() => setTheme(t as Theme)}
                className="rm-theme-dot"
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
          <button className="rm-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      <div className="rm-main">
        <div className="rm-header">
          <div>
            <h1 className="rm-title">Learning Roadmap</h1>
            <p className="rm-subtitle">Your path from zero to freelancing — step by step</p>
          </div>
          <div className="rm-overall-progress">
            <div className="rm-overall-nums">
              <span className="rm-overall-done">{completedCount}</span>
              <span className="rm-overall-total">/{totalSteps} steps</span>
            </div>
            <div className="rm-overall-bar-wrap">
              <div className="rm-overall-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="rm-overall-pct">{progressPct}% complete</div>
          </div>
        </div>

        <div className="rm-track-tabs">
          {tracks.map(track => {
            const done = track.steps.filter(s => completed.includes(s.id)).length;
            return (
              <button
                key={track.id}
                className={`rm-track-tab ${activeTrack === track.id ? 'active' : ''}`}
                onClick={() => setActiveTrack(track.id)}
                style={activeTrack === track.id ? { borderColor: track.color, color: track.color } : {}}
              >
                <span>{track.icon}</span>
                <span>{track.title}</span>
                <span className="rm-track-progress">{done}/{track.steps.length}</span>
              </button>
            );
          })}
        </div>

        <div className="rm-track-header" style={{ borderLeftColor: currentTrack.color }}>
          <div className="rm-track-title" style={{ color: currentTrack.color }}>
            {currentTrack.icon} {currentTrack.title}
          </div>
          <div className="rm-track-meta">
            {trackCompleted} of {currentTrack.steps.length} steps completed
          </div>
          <div className="rm-track-bar-wrap">
            <div className="rm-track-bar-fill"
              style={{
                width: `${(trackCompleted / currentTrack.steps.length) * 100}%`,
                background: currentTrack.color,
              }} />
          </div>
        </div>

        <div className="rm-steps">
          {currentTrack.steps.map((step, index) => {
            const isDone = completed.includes(step.id);
            const isExpanded = expandedStep === step.id;
            const lc = levelColors[step.level];

            return (
              <div key={step.id} className="rm-step-wrap">
                {index > 0 && (
                  <div className={`rm-connector ${completed.includes(currentTrack.steps[index - 1].id) ? 'done' : ''}`}
                    style={completed.includes(currentTrack.steps[index - 1].id) ? { background: currentTrack.color } : {}} />
                )}
                <div className={`rm-step ${isDone ? 'done' : ''} ${isExpanded ? 'expanded' : ''}`}>
                  <div className="rm-step-main" onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                    <div className="rm-step-left">
                      <div
                        className={`rm-step-circle ${isDone ? 'done' : ''}`}
                        style={isDone ? { background: currentTrack.color, borderColor: currentTrack.color } : {}}
                        onClick={e => { e.stopPropagation(); toggleComplete(step.id); }}
                      >
                        {isDone ? '✓' : index + 1}
                      </div>
                      <div className="rm-step-info">
                        <div className="rm-step-title">{step.title}</div>
                        <div className="rm-step-meta">
                          <span className="rm-step-duration">⏱ {step.duration}</span>
                          <span className="rm-level-badge" style={{ background: lc.bg, color: lc.color }}>
                            {step.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="rm-step-right">
                      {isDone && <span className="rm-done-badge">✓ Done</span>}
                      <span className="rm-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="rm-step-detail">
                      <div className="rm-step-desc">{step.desc}</div>
                      <div className="rm-resources">
                        <div className="rm-resources-label">📚 Resources</div>
                        <div className="rm-resources-list">
                          {step.resources.map(r => (
                            <a key={r.label} href={r.url}
                              target={r.url.startsWith('http') ? '_blank' : '_self'}
                              rel="noreferrer"
                              className="rm-resource-link">
                              {r.label} →
                            </a>
                          ))}
                        </div>
                      </div>
                      <button
                        className="rm-mark-btn"
                        style={isDone ? {} : { background: currentTrack.color }}
                        onClick={() => toggleComplete(step.id)}
                      >
                        {isDone ? '↩ Mark as not done' : '✓ Mark as complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {progressPct === 100 && (
          <div className="rm-congrats">
            🎉 You've completed the full roadmap! Time to land your first gig on FreshFly.
            <button className="rm-congrats-btn" onClick={() => navigate('/jobs')}>
              Browse jobs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}