import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'var(--font)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 8,
            letterSpacing: '-0.5px',
          }}>
            Something went wrong
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 28,
            maxWidth: 400,
            lineHeight: 1.6,
          }}>
            An unexpected error occurred. This has been logged.
            Try refreshing the page — if the problem persists, contact support.
          </div>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            marginBottom: 24,
            maxWidth: 500,
            wordBreak: 'break-all',
          }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Go back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}