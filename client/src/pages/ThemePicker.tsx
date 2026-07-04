import { useNavigate } from 'react-router-dom';
import { useTheme, themes } from '../store/ThemeContext';
import type { Theme } from '../store/ThemeContext';
import '../styles/themepicker.css';

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="picker-page">
      <div className="picker-card">
        <div className="picker-header">
          <div className="picker-logo">FreshFly ✦</div>
          <h1 className="picker-title">Choose your workspace</h1>
          <p className="picker-sub">
            Pick a vibe that matches you. You can always switch later from Settings.
          </p>
        </div>

        <div className="picker-grid">
          {themes.map(t => (
            <div
              key={t.id}
              className={`theme-card ${theme === t.id ? 'selected' : ''}`}
              onClick={() => setTheme(t.id as Theme)}
              style={{ '--theme-color': t.color } as React.CSSProperties}
            >
              <div className="theme-preview" style={{ background: t.color }}>
                <div className="theme-preview-sidebar" />
                <div className="theme-preview-content">
                  <div className="theme-preview-bar" />
                  <div className="theme-preview-bar short" />
                  <div className="theme-preview-cards">
                    <div className="theme-preview-mini-card" />
                    <div className="theme-preview-mini-card" />
                  </div>
                </div>
              </div>
              <div className="theme-info">
                <div className="theme-emoji">{t.emoji}</div>
                <div className="theme-name">{t.label}</div>
                <div className="theme-desc">{t.desc}</div>
              </div>
              {theme === t.id && <div className="theme-selected-badge">✓ Selected</div>}
            </div>
          ))}
        </div>

        <button
          className="picker-continue"
          onClick={() => navigate('/profile')}
        >
          Continue with {themes.find(t => t.id === theme)?.emoji} {themes.find(t => t.id === theme)?.label} →
        </button>

        <p className="picker-skip" onClick={() => navigate('/profile')}>
          Skip for now
        </p>
      </div>
    </div>
  );
}